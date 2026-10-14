// ==========================================
// 1. CONFIGURAÇÕES E CONSTANTES
// ==========================================
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImIyOTM5MjhlNzFiMTRjOTM4MTA5NDhiOWNkNTliMGEwIiwiaCI6Im11cm11cjY0In0='; 

const pontoOrigem = [-47.8972, -22.0233]; // Ponto de partida fixo

// Coordenadas dos pontos monitorados
const COORDS_CRISTO = [-47.9122, -22.0171]; // SENSOR_01
const COORDS_SESC   = [-47.9058, -22.0167]; // SENSOR_02

const RAIO_BLOQUEIO_METROS = 250; 

const coordsOrigemOverlay = ol.proj.fromLonLat(pontoOrigem);
const coordsCristoOverlay = ol.proj.fromLonLat(COORDS_CRISTO);
const coordsSescOverlay   = ol.proj.fromLonLat(COORDS_SESC);

const destinosFixos = {
    'shopping': [-47.9150, -22.0175],
    'cristo': COORDS_CRISTO,
    'sesc': COORDS_SESC
};

// Armazena as coordenadas do destino e rotas calculadas
window.destinoAtualCoordenadas = null;
window.rotasCalculadas = [];

// ==========================================
// 2. INICIALIZAÇÃO DO MAPA E CAMADAS
// ==========================================
const vetorSource = new ol.source.Vector();
const vetorLayer = new ol.layer.Vector({
    source: vetorSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({ color: '#3b82f6', width: 6 })
    })
});

const map = new ol.Map({
    target: 'map-container',
    layers: [
        new ol.layer.Tile({ source: new ol.source.OSM() }),
        vetorLayer
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat(pontoOrigem),
        zoom: 14
    })
});

// ==========================================
// 3. VINCULAÇÃO DOS OVERLAYS
// ==========================================
const elUser = document.getElementById('overlay-user');
if (elUser) {
    map.addOverlay(new ol.Overlay({ element: elUser, position: coordsOrigemOverlay, positioning: 'center-center' }));
}

const elBloqueio = document.getElementById('overlay-bloqueio');
if (elBloqueio) {
    map.addOverlay(new ol.Overlay({ element: elBloqueio, position: coordsCristoOverlay, positioning: 'center-center' }));
}

const elSubindo = document.getElementById('overlay-subindo');
if (elSubindo) {
    map.addOverlay(new ol.Overlay({ element: elSubindo, position: coordsSescOverlay, positioning: 'center-center' }));
}

// Overlay do Destino Final
const elDestino = document.getElementById('overlay-destino');
let overlayDestino = null;

if (elDestino) {
    overlayDestino = new ol.Overlay({ 
        element: elDestino, 
        positioning: 'center-center' 
    });
    map.addOverlay(overlayDestino);
}

// ==========================================
// 4. AUXILIARES E PROCESSAMENTO DE ROTA
// ==========================================
function calcularDistanciaMetros(coords1, coords2) {
    const R = 6371e3;
    const rad = Math.PI / 180;
    const dLat = (coords2[1] - coords1[1]) * rad;
    const dLon = (coords2[0] - coords1[0]) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coords1[1] * rad) * Math.cos(coords2[1] * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function tracarR() {
    if (window.VozNavegacao && typeof window.VozNavegacao.desbloquearAudio === 'function') {
        window.VozNavegacao.desbloquearAudio();
    }

    const inputDestino = document.getElementById('destination') || document.querySelector('input[type="text"]');
    let enderecoDigitado = inputDestino ? inputDestino.value.trim() : '';

    if (!enderecoDigitado) {
        alert('Por favor, digite um endereço de destino!');
        return;
    }

    const buscaMin = enderecoDigitado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let destinoCoordenadas = null;
    let nomePontoDetectado = "";

    if (buscaMin.includes('cristo') || buscaMin.includes('rotatoria do cristo')) {
        destinoCoordenadas = COORDS_CRISTO;
        nomePontoDetectado = "Rotatória do Cristo";
    } else if (buscaMin.includes('sesc')) {
        destinoCoordenadas = COORDS_SESC;
        nomePontoDetectado = "SESC São Carlos";
    } else if (buscaMin.includes('shopping') || buscaMin.includes('iguatemi')) {
        destinoCoordenadas = destinosFixos['shopping'];
    } else {
        const textoComContexto = `${enderecoDigitado}, São Carlos, SP, Brasil`;
        destinoCoordenadas = await buscarCoordenadasPorEndereco(textoComContexto);
    }

    if (!destinoCoordenadas) {
        alert('Endereço não encontrado em São Carlos.');
        return;
    }

    window.destinoAtualCoordenadas = destinoCoordenadas;
    processarRotaComSeguranca(destinoCoordenadas, nomePontoDetectado);
}

function processarRotaComSeguranca(coordsDestino, nomePonto) {
    const s1Alagado = (window.statusSensor01 === 'ATENÇÃO' || window.statusSensor01 === 'CRÍTICO');
    const s2Alagado = (window.statusSensor02 === 'ATENÇÃO' || window.statusSensor02 === 'CRÍTICO');

    const distCristo = calcularDistanciaMetros(coordsDestino, COORDS_CRISTO);
    const distSesc   = calcularDistanciaMetros(coordsDestino, COORDS_SESC);

    if (s1Alagado && (distCristo <= RAIO_BLOQUEIO_METROS || nomePonto === "Rotatória do Cristo")) {
        limparRotaEMarcadores();
        const mensagem = 'A Rotatória do Cristo está com ponto de alagamento. Rota bloqueada para a sua segurança!';
        if (typeof window.exibirAlertaBloqueioDestino === 'function') {
            window.exibirAlertaBloqueioDestino(mensagem);
        }
        if (window.VozNavegacao && typeof window.VozNavegacao.falar === 'function') {
            window.VozNavegacao.falar(mensagem);
        }
        return;
    }

    if (s2Alagado && (distSesc <= RAIO_BLOQUEIO_METROS || nomePonto === "SESC São Carlos")) {
        limparRotaEMarcadores();
        const mensagem = 'A região do SESC São Carlos está com ponto de alagamento. Rota bloqueada para a sua segurança!';
        if (typeof window.exibirAlertaBloqueioDestino === 'function') {
            window.exibirAlertaBloqueioDestino(mensagem);
        }
        if (window.VozNavegacao && typeof window.VozNavegacao.falar === 'function') {
            window.VozNavegacao.falar(mensagem);
        }
        return;
    }

    buscarRotaNaAPI(pontoOrigem, coordsDestino, s1Alagado, s2Alagado);
}

function limparRotaEMarcadores() {
    vetorSource.clear();
    const elDestino = document.getElementById('overlay-destino');
    if (elDestino) elDestino.style.display = 'none';
    
    const container = document.getElementById('painel-rotas');
    if (container) container.remove();

    if (window.VozNavegacao && typeof window.VozNavegacao.parar === 'function') {
        window.VozNavegacao.parar();
    }
}

function recalcularRotaAtiva() {
    if (window.destinoAtualCoordenadas) {
        console.log('Recalculando rota ativa após mudança nos sensores...');
        processarRotaComSeguranca(window.destinoAtualCoordenadas, "");
    }
}

async function buscarCoordenadasPorEndereco(texto) {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(texto)}&boundary.rect=-48.00,-22.10,-47.80,-21.90`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        return (dados.features && dados.features.length > 0) ? dados.features[0].geometry.coordinates : null;
    } catch {
        return null;
    }
}

// ==========================================
// 5. INTEGRAÇÃO COM A API E MÚLTIPLAS ROTAS
// ==========================================
function buscarRotaNaAPI(origem, destino, desviarP1, desviarP2) {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

    const dados = { 
        coordinates: [origem, destino],
        instructions: true,
        language: "pt",
        alternative_routes: {
            target_count: 3
        }
    };
    
    const poligonosEvitar = [];

    if (desviarP1) {
        poligonosEvitar.push([
            [-47.9125, -22.0210],
            [-47.9065, -22.0210],
            [-47.9065, -22.0150],
            [-47.9125, -22.0150],
            [-47.9125, -22.0210]
        ]);
    }

    if (desviarP2) {
        poligonosEvitar.push([
            [-47.9088, -22.0197],
            [-47.9028, -22.0197],
            [-47.9028, -22.0137],
            [-47.9088, -22.0137],
            [-47.9088, -22.0197]
        ]);
    }

    if (poligonosEvitar.length > 0) {
        dados.options = {
            avoid_polygons: {
                type: "MultiPolygon",
                coordinates: poligonosEvitar.map(p => [p])
            }
        };
    }

    fetch(url, {
        method: 'POST',
        headers: { 
            'Authorization': ORS_API_KEY, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(dados)
    })
    .then(r => r.json())
    .then(resultado => {
        if (resultado.features && resultado.features.length > 0) {
            window.rotasCalculadas = resultado.features;

            // Renderiza a primeira rota (padrão)
            exibirRotaSelecionada(0, destino);

            // Desenha a lista de cards dentro do mapa
            renderizarPainelRotas(resultado.features, destino);

        } else {
            limparRotaEMarcadores();
            const msgErro = 'Não foi possível calcular uma rota alternativa segura para desviar dos alagamentos.';
            if (typeof window.exibirAlertaBloqueioDestino === 'function') {
                window.exibirAlertaBloqueioDestino(msgErro);
            } else {
                alert(msgErro);
            }
        }
    })
    .catch(err => {
        console.error('Erro na API ORS:', err);
        limparRotaEMarcadores();
        alert('Erro ao calcular a rota segura.');
    });
}

function exibirRotaSelecionada(index, destino) {
    const featureRota = window.rotasCalculadas[index];
    if (!featureRota) return;

    vetorSource.clear();

    const format = new ol.format.GeoJSON();
    const rotaGeoJSON = format.readFeature(featureRota, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    vetorSource.addFeature(rotaGeoJSON);

    if (overlayDestino && elDestino) {
        const coordsDestinoProj = ol.proj.fromLonLat(destino);
        overlayDestino.setPosition(coordsDestinoProj);
        elDestino.style.display = 'flex';
        
        const labelDestino = document.getElementById('label-destino');
        if (labelDestino) {
            const inputVal = document.getElementById('destination')?.value;
            labelDestino.innerText = inputVal ? inputVal.toUpperCase() : 'DESTINO FINAL';
        }
    }

    map.getView().fit(vetorSource.getExtent(), { padding: [60, 60, 60, 60], duration: 800 });

    if (window.VozNavegacao && featureRota.properties.segments) {
        const segmento = featureRota.properties.segments[0];
        window.VozNavegacao.iniciarRota(segmento);
    }
}

function renderizarPainelRotas(features, destino) {
    let container = document.getElementById('painel-rotas');
    
    if (!container) {
        container = document.createElement('section');
        container.id = 'painel-rotas';
        container.className = 'card card-rotas-sidebar';
        
        // Insere no topo da sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.insertBefore(container, sidebar.firstChild);
        } else {
            document.body.appendChild(container);
        }
    }

    container.innerHTML = '';

    // Cabeçalho do cartão com o ícone do sistema
    const header = document.createElement('div');
    header.className = 'card-header';
    header.style.marginBottom = '12px';
    header.innerHTML = `
        <div class="icon-box-blue"><i class="fas fa-route"></i></div>
        <h2 style="font-size: 1rem; font-weight: 800; color: var(--navy-blue);">Selecione a Rota</h2>
    `;
    container.appendChild(header);

    const listaDiv = document.createElement('div');
    listaDiv.className = 'lista-rotas-wrapper';

    features.forEach((feature, index) => {
        const prop = feature.properties.summary;
        const tempoMin = Math.round(prop.duration / 60);
        const distanciaKm = (prop.distance / 1000).toFixed(1);
        
        const viaStep = feature.properties.segments[0]?.steps?.find(s => s.name && s.name !== '-');
        const viaPrincipal = viaStep ? viaStep.name : `Opção ${index + 1}`;
        const eMelhorRota = index === 0;

        const card = document.createElement('div');
        card.className = `card-rota-item ${eMelhorRota ? 'active' : ''}`;
        card.innerHTML = `
            <div class="rota-indicador"></div>
            <div class="rota-icone">
                <i class="fas fa-car"></i>
            </div>
            <div class="rota-detalhes">
                <div class="via-nome">via ${viaPrincipal}</div>
                ${eMelhorRota ? '<div class="sub-tag">Melhor rota, sem alagamentos</div>' : ''}
                <div class="btn-acoes">
                    <button type="button" class="btn-detalhes-link">Iniciar Rota</button>
                </div>
            </div>
            <div class="rota-metricas">
                <span class="tempo-estimado">${tempoMin} min</span>
                <span class="distancia-km">${distanciaKm} km</span>
            </div>
        `;

        // Evento de clique para selecionar a rota
        card.onclick = () => {
            // 1. Desenha a rota selecionada e inicia a navegação
            if (typeof window.exibirRotaSelecionada === 'function') {
                window.exibirRotaSelecionada(index, destino);
            }

            // 2. Oculta e remove o painel da sidebar imediatamente
            container.remove();
        };

        listaDiv.appendChild(card);
    });

    container.appendChild(listaDiv);
}

function toggleFullscreen() {
    const mapElement = document.getElementById('map-container');
    const btnIcon = document.querySelector('#btn-fullscreen i');
    if (!document.fullscreenElement) {
        if (mapElement.requestFullscreen) mapElement.requestFullscreen();
        if (btnIcon) btnIcon.className = 'fas fa-compress';
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        if (btnIcon) btnIcon.className = 'fas fa-expand';
    }
}

document.addEventListener('fullscreenchange', () => setTimeout(() => map.updateSize(), 200));

// Exportações Globais
window.ORS_API_KEY = ORS_API_KEY;
window.tracarR = tracarR;
window.recalcularRotaAtiva = recalcularRotaAtiva;
window.processarRotaComSeguranca = processarRotaComSeguranca;
window.exibirRotaSelecionada = exibirRotaSelecionada;
window.toggleFullscreen = toggleFullscreen;
window.calcularDistanciaMetros = calcularDistanciaMetros;

document.addEventListener('DOMContentLoaded', () => {
    const inputDestino = document.getElementById('destination') || document.querySelector('input[type="text"]');
    if (inputDestino) {
        inputDestino.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') tracarR();
        });
    }
});