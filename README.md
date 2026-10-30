<img width="500" height="679" alt="unnamed" src="https://github.com/user-attachments/assets/a75986eb-2421-4c28-b431-5ad6d17b9b0b" />

**FLOODPATH - Sistema de Monitoramento e Alerta de Alagamentos em Tempo Real**

***

*O FloodPath é uma solução tecnológica que integra Internet das Coisas (IoT) e desenvolvimento web para monitorar pontos críticos de alagamento na cidade de São Carlos (SP). O sistema fornece informações e alertas em tempo real para evitar que motoristas e pedestres fiquem ilhados durante tempestades.*

***

📌 **Informações Gerais da equipe (NEXUS FOUR)**

-*Ryan Silva:* Líder do Projeto e Desenvolvedor Back-end

-*Rafaela Alves:* Desenvolvedora Full Stack

-*Stella Ribeiro:* Analista de Sistemas e UI/UX Designer

*Nathan Pereira:* Administrador de Banco de Dados (DBA)

***

🔗 **Links Úteis e Acesso**

🌐 Aplicação Frontend Final: **([Acessar FloodPath App](https://rafaela0011.github.io/FloodPathFinal/)**

🛬 Landing Page:**[Acessar Landing Page](https://kapooll.github.io/Landing-page-floodpath/)**

📋 Gestão do Projeto (Trello): **[Acessar Quadro Kanban](https://trello.com/b/FotNUUH5)** 

📊 Apresentação: Slides no Canva: **[Acessar Canva](https://www.canva.com/design/DAHMK9Jo8pQ/UobYloi3jmUTu1iBlMoIjw/edit)** 

📑 Planilha de Controle: **[Acessar Planilha de Controle](https://sesisenaispedu-my.sharepoint.com/:x:/r/personal/nathan_pereira_portalsesisp_org_br/_layouts/15/Doc.aspx?sourcedoc=%7B45195e0a-2134-440c-9b4c-25d524a9fbd1%7D&action=default
)**

🗺️ Referência Técnica: Mapeamento de Áreas de Risco em São Carlos (PDF) **[Acessar Planilha de Controle]( https://drive.google.com/file/d/1vR1L2_l8O7wPz2BOEyt5utUdbxp9kjbE/view?usp=sharing)**

***

👤 **Persona e Dores do Cliente**

Persona: Carla Mendes, 34 anos, assistente administrativa em São Carlos. Desloca-se diariamente de carro para o trabalho e frequenta a região do shopping no horário do almoço.
Dores Mapeadas: Tensão e ansiedade constante em dias de chuva pelo risco de perder o veículo ou ficar ilhada; prejuízos financeiros imprevisíveis; falta de previsibilidade e informações confiáveis para planejar rotas seguras na cidade.

***

📄 **1. Escopo**

O projeto visa implementar uma rede de sensores IoT instalados em bueiros e rios em áreas vulneráveis de São Carlos, conectados a uma plataforma web acessível à população.
A solução contempla:
Leitura contínua da lâmina d'água via sensores ultrassônicos de distância acoplados a microcontroladores ESP-32.
API REST em Java para processamento, validação e armazenamento do histórico em banco de dados.
Interface web interativa em HTML/CSS/JS com consumo de APIs de mapas e clima.
Sistema de previsão de alagamentos e cálculo de tempo estimado para ilhamento.

***

🎯 **2. Objetivos do Projeto**

Monitoramento Preventivo: Capturar dados contínuos sobre a variação da altura da água em pontos críticos de São Carlos.
Prevenção de Danos: Informar a população com antecedência para evitar prejuízos materiais (perda de veículos) e garantir a integridade física de motoristas e pedestres.
Autonomia na Navegação Urbana: Oferecer aos cidadãos uma ferramenta simples para consulta de vias limpas ou intransitáveis antes de realizarem seus trajetos.
Mapeamento Histórico: Gerar dados sobre a frequência e intensidade de cheias para auxiliar no planejamento urbano da cidade.
Interface Intuitiva: Exibir o status de risco através de sinais visuais claros (ex: verde para via livre, vermelho para risco ou alagamento).

***

🏗️ **3. Arquitetura Técnica e Detalhamento de APIsO ecossistema do FloodPath é dividido em hardware de precisão, APIs de servidor (Back-end) e APIs de navegação e integração (Front-end).**

⚙️ *APIs de Back-end (Java)*
A API desenvolvida em Java atua como o núcleo de inteligência e persistência do sistema:Endpoints de Ingestão (POST /api/sensores/leitura): Recebe os dados da distância medida pelo sensor ultrassônico enviados pelos módulos ESP-32 em tempo real.
Regras de Negócio e Validação: Converte a distância lida em altura do nível do rio/bueiro, filtra ruídos pontuais e calcula a taxa de elevação da água.
Endpoints de Consulta (GET /api/pontos/status): Disponibiliza respostas em formato JSON para o Front-end com a lista de locais e suas respetivas cores/situações.
Persistência de Dados: Registra todas as medições no banco de dados relacional para composição do histórico de enchentes.
🌐 *APIs de Front-end (JavaScript / Navegador)*
No Front-end, o JavaScript consome a API do servidor e integra APIs externas para proporcionar a experiência visual:
Fetch API / Axios: Executa requisições assíncronas periódicas para buscar os dados atualizados da API Java no servidor.
API de Mapa (Openlayers API): Renderiza o mapa interativo na tela, gerencia marcadores e altera a coloração dos pontos monitorados (verde, amarelo, vermelho).
Geolocation API: Obtém a posição atual do usuário (mediante permissão) para destacar pontos de alagamento próximos ao seu trajeto.
Weather API (OpenWeatherMap / SIMAR): Consome dados de previsão meteorológica para exibir o volume de chuva esperado para as próximas horas em São Carlos.

***

⚠️ **4. Análise de Riscos e Soluções Risco**:

Descrição Solução Proposta Perda de Conectividade do Hardware O ESP-32 pode perder conexão Wi-Fi durante tempestades severas.Implementação de buffer local no dispositivo para envio em lote após reconexão e alerta de status 'Offline' na API.
Danos ao Sensor UltrassônicoUmidade excessiva ou respingos diretos danificando a cápsula emissora do sensor.Utilização de sensores ultrassônicos blindados à prova d'água (ex: modelo JSN-SR04T) instalados em estrutura protegida.Falsos Positivos de Alagamento
Objetos flutuantes ou resíduos passando sob o feixe ultrassônico.Algoritmo de filtragem por média móvel na API Java para ignorar picos isolados de variação de distância.
Sobrecarga de Acessos Picos simultâneos de requisições na plataforma durante tempestades.Otimização dos endpoints da API Java com caching de consultas para rápida resposta ao cliente web.

***

📅 **5. Cronograma de Desenvolvimento**

Etapa 1: Análise e Design da Solução Mapeamento das áreas de risco de São Carlos (Shopping, Rotatória do Cristo, etc.).Criação da Persona (Carla Mendes) e prototipação de UI/UX no Figma.Definição da arquitetura e escolha dos componentes de hardware.
Etapa 2: Desenvolvimento do Hardware e Sensores (IoT)Montagem do circuito no ESP-32 acoplado ao sensor ultrassônico de distância.Programação da lógica de calibração e envio telemétrico das leituras.Testes em ambiente controlado (simulação de elevação da superfície da água).
Etapa 3: Desenvolvimento do Back-end e Banco de DadosModelagem do banco de dados relacional.Construção da API REST em Java para recebimento e conversão dos dados do sensor em níveis de risco.Criação das rotas de consulta JSON para consumo do cliente web.
Etapa 4: Desenvolvimento do Frontend e Integração das APIsConstrução da interface responsiva em HTML5, CSS3 e JavaScript.Integração da Fetch API com a API Java e implementação das APIs de Mapa e Clima.Testes de integração de ponta a ponta (Sensor -> API Back -> Banco -> APIs Front).
Etapa 5: Validação, Landing Page e ApresentaçãoCriação da Landing Page institucional do FloodPath.Testes finais com cenários de tempestade simulada e apresentação final.

***

🛠️  **6. Recursos UtilizadosPessoal1 Analista e Designer (UI/UX)1 Desenvolvedor Back-end (Java API)**

1 Desenvolvedora Full Stack
1 Administrador de Back , Hardware e Microeletrônica Microcontrolador ESP-32 Sensor Ultrassônico de Distância à Prova D'água (JSN-SR04T ou HC-SR04 em case selado)Protoboards, Jumpers, Resistores e Fonte de AlimentaçãoEnvoltório protetor hermético contra intempériesSoftware, Tecnologias e APIsBack-end: Java (API REST), Banco de Dados Relacional (MySQL / PostgreSQL).Front-end: HTML5, CSS3, JavaScript, Fetch API / Axios.APIs Integradas: OpenWeatherMap API, Leaflet / Google Maps API, Geolocation API.Prototipação e Gestão: Figma, Trello, Canva, Microsoft Excel, GitHub Pages.

***

💰 **7. Custos e Estimativa Orçamentária**

Pessoal
Desenvolvedores de Software
4 desenvolvedores trabalhando por 5 dias na semana.

Gerente de Projeto
1 gerente de projeto.
1 gerente reserva para casos adversos.
Tecnologia
Ambiente de Desenvolvimento Integrado (IDE)
Custo total (considerando licenças): R$ 0,00
Sistemas de Versionamento de Código
Custo total (considerando licenças Git/GitHub): R$ 0,00
Servidores e Infraestrutura em Nuvem
Custo total (considerando serviços em nuvem): R$ 500,00
Ferramentas de Teste de Software
Custo total (considerando licenças): R$ 0,00
Módulos IoT e Sensores Ultrassônicos
Custo total: R$ 500,00

Equipamentos
Estrutura Física de Proteção e Fixação em Campo (Pontes/Bueiros)
Custo total: R$ 5.000,00

Total Geral
Pessoal: R$ 0,00
Tecnologia: R$ 1.000,00
Equipamentos: R$ 5.000,00

Custo Total do Projeto
R$ 6.000,00

***

📋 **8. Documentação e Requisitos**

Requisitos Funcionais (RF)
RF01 - Captura por Ultrassom: O módulo ESP-32 deve realizar medições periódicas de distância do sensor até a superfície da água e transmitir os dados via HTTP POST para a API Java.
RF02 - Mapeamento em Tempo Real: O mapa no Front-end deve atualizar automaticamente o indicador conforme o status retornado pela API Java (Verde = Normal, Amarelo = Atenção, Vermelho = Alagado).
RF03 - Histórico de Ocorrências: O banco de dados deve registrar data, hora, localização e distância/altura da água para cada medição realizada.
RF04 - Alerta e Previsão: O sistema deve calcular o tempo estimado até o alagamento em pontos críticos (ex: shopping) baseado na velocidade de variação da lâmina d'água.
Requisitos Não Funcionais (RNF)
RNF01 - Usabilidade: A interface gráfica deve ser responsiva e legível em dispositivos móveis.
RNF02 - Desempenho: A API Java deve processar as leituras do ultrassom e responder às requisições do Front-end em menos de 2 segundos.
RNF03 - Disponibilidade: O sistema deve manter uptime elevado durante tempestades e picos de acessos na cidade.

