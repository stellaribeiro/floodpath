import machine
import time
import ujson as json
import network
import urequests
import gc

# --- 1. CONFIGURAÇÃO DO WI-FI ---
WIFI_SSID = "WIFI_IOT_CFP601"
WIFI_PASSWORD = "iot@senai601"

JAVA_SERVER_URL = "http://10.110.22.23:8080/api/rios/leitura"

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(WIFI_SSID, WIFI_PASSWORD)

print("Conectando ao Wi-Fi...", end="")
while not wlan.isconnected():
    time.sleep(0.5)
    print(".", end="")
print("\nConectado! IP do ESP32:", wlan.ifconfig()[0])

# --- 2. CONFIGURAÇÃO DOS DOIS SENSORES ---

# SENSOR 01
SENSOR1_ID = "SENSOR_01"
trig1_pin = machine.Pin(5, machine.Pin.OUT)
echo1_pin = machine.Pin(18, machine.Pin.IN)
ALTURA_MAXIMA_SENSOR1 = 19.88 # Altura em cm do Sensor 1 até o fundo

# SENSOR 02
SENSOR2_ID = "SENSOR_02"
trig2_pin = machine.Pin(19, machine.Pin.OUT)
echo2_pin = machine.Pin(21, machine.Pin.IN)
ALTURA_MAXIMA_SENSOR2 = 20.0  # Altura em cm do Sensor 2 até o fundo

# Função genérica para medir distância de qualquer sensor
def medir_distancia(trig, echo):
    trig.value(0)
    time.sleep_us(2)
    
    trig.value(1)
    time.sleep_us(10)
    trig.value(0)
    
    duracao = machine.time_pulse_us(echo, 1, 30000) 
    
    if duracao < 0:
        return None 
        
    distancia = (duracao * 0.0344) / 2
    return distancia

# Cabeçalho para o Spring Boot liberar o socket limpo
headers = {
    'Content-Type': 'application/json',
    'Connection': 'close'
}

# Função auxiliar para realizar a leitura e o envio HTTP
def processar_e_enviar(sensor_id, trig_p, echo_p, altura_maxima):
    cm = medir_distancia(trig_p, echo_p)
    
    if cm is not None:
        nivel_calculado = altura_maxima - cm
        if nivel_calculado < 0: 
            nivel_calculado = 0.0

        dados = {
            "sensorId": sensor_id,
            "distancia": round(cm, 2),
            "nivelAgua": round(nivel_calculado, 2)
        }
        
        json_data = json.dumps(dados)
        print(f"Enviando [{sensor_id}] para o Back-end:", json_data)
        
        try:
            # Envia para a API Java
            response = urequests.post(JAVA_SERVER_URL, data=json_data, headers=headers)
            
            resposta_servidor = response.text
            print(f"Resposta do Java para [{sensor_id}]:", resposta_servidor)
            
            # --- SOLUÇÃO DO BUG DO MICROPYTHON ---
            response.close() # Fecha a conexão física
            del response     # Deleta o objeto da memória do ESP32
            gc.collect()     # Força o coletor de lixo a limpar os sockets
            
            print(f"[{sensor_id}] Enviado com sucesso!\n")
            
        except Exception as e:
            print(f"Erro de envio no [{sensor_id}]:", e)
            
    else:
        print(f"Erro: [{sensor_id}] fora de alcance ou falha de leitura.\n")

# --- 3. LOOP DE LEITURA CONTÍNUA (A CADA 10 SEGUNDOS) ---
print("Iniciando monitoramento contínuo dos 2 sensores...")

while True:
    # 1. Leitura e envio do SENSOR 01
    processar_e_enviar(SENSOR1_ID, trig1_pin, echo1_pin, ALTURA_MAXIMA_SENSOR1)
    
    # Pausa de 100ms para evitar interferência de ondas sonoras entre os sensores
    time.sleep(0.1)
    
    # 2. Leitura e envio do SENSOR 02
    processar_e_enviar(SENSOR2_ID, trig2_pin, echo2_pin, ALTURA_MAXIMA_SENSOR2)
    
    # Aguarda o intervalo antes do próximo ciclo completo de varredura
    time.sleep(10)
