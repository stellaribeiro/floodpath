// ==========================================
// 1. CHAVE DA API CONFIGURADA
// ==========================================
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImIyOTM5MjhlNzFiMTRjOTM4MTA5NDhiOWNkNTliMGEwIiwiaCI6Im11cm11cjY0In0='; 

// Ponto de origem fixo da maquete (São Carlos)
const pontoOrigem = [-47.8972, -22.0233]; 

// Destinos padrão para atalhos
const destinosFixos = {
    'shopping': [-47.9170, -22.0185],
    'campinas': [-47.0608, -22.9064]
};

// ==========================================
// 2. INICIALIZAR O MAPA LIMPO (Sem Rota)
// ==========================================
const map = new ol.Map({
    target: 'map-container',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-47.8972, -22.0233]), // Centro de São Carlos
        zoom: 13
    })
});

const vetorSource = new ol.source.Vector();
const vetorLayer = new ol.layer.Vector({
    source: vetorSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#3b82f6', // Linha azul da rota
            width: 6
        })
    })
});
map.addLayer(vetorLayer);

// ==========================================
// 3. FUNÇÃO PRINCIPAL DO BOTÃO (onclick="tracarR()")
// ==========================================
async function tracarR() {
    const inputDestino = document.getElementById('destino') || document.querySelector('input[type="text"]');
    let enderecoDigitado = inputDestino ? inputDestino.value.trim() : '';

    if (!enderecoDigitado) {
        alert('Por favor, digite um endereço ou cidade de destino!');
        return;
    }

    const buscaMin = enderecoDigitado.toLowerCase();

    // Verificação de Atalhos
    if (buscaMin.includes('shopping') || buscaMin.includes('iguatemi')) {
        buscarRotaNaAPI(pontoOrigem, destinosFixos['shopping'], true);
        return;
    }
    if (buscaMin.includes('campinas')) {
        buscarRotaNaAPI(pontoOrigem, destinosFixos['campinas'], true);
        return;
    }

    // 1. Converte texto em coordenadas garantindo foco em São Carlos/SP
    const textoComContexto = buscaMin.includes('são carlos') || buscaMin.includes('sao carlos') 
        ? enderecoDigitado 
        : `${enderecoDigitado}, São Carlos, SP`;

    const destinoCoordenadas = await buscarCoordenadasPorEndereco(textoComContexto);

    if (destinoCoordenadas) {
        // 2. Tenta traçar a rota desviando
        buscarRotaNaAPI(pontoOrigem, destinoCoordenadas, true);
    } else {
        alert('Endereço não encontrado. Tente especificar o bairro ou número.');
    }
}

// ==========================================
// 4. GEOCONVERSÃO (TEXTO -> LON/LAT)
// ==========================================
async function buscarCoordenadasPorEndereco(texto) {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(texto)}&boundary.rect=-48.00,-22.10,-47.80,-21.90`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados.features && dados.features.length > 0) {
            return dados.features[0].geometry.coordinates;
        }
        return null;
    } catch (erro) {
        console.error('Erro na geocodificação:', erro);
        return null;
    }
}

// ==========================================
// 5. REQUISIÇÃO PARA A API COM BLOQUEIO FLEXÍVEL
// ==========================================
function buscarRotaNaAPI(origem, destino, desviar) {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

    const dados = {
        coordinates: [origem, destino]
    };

    if (desviar) {
        const poligonoBaixadaCristo = [
            [-47.9150, -22.0195],
            [-47.9090, -22.0195],
            [-47.9090, -22.0150],
            [-47.9150, -22.0150],
            [-47.9150, -22.0195]
        ];

        const poligonoCentro = [
            [-47.8940, -22.0220],
            [-47.8910, -22.0220],
            [-47.8910, -22.0190],
            [-47.8940, -22.0190],
            [-47.8940, -22.0220]
        ];

        dados.options = {
            avoid_polygons: {
                type: "MultiPolygon",
                coordinates: [
                    [poligonoBaixadaCristo],
                    [poligonoCentro]
                ]
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
    .then(resposta => resposta.json())
    .then(resultado => {
        if (resultado.features && resultado.features.length > 0) {
            vetorSource.clear();

            const format = new ol.format.GeoJSON();
            const rota = format.readFeature(resultado.features[0], {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });

            vetorSource.addFeature(rota);
            map.getView().fit(vetorSource.getExtent(), { padding: [50, 50, 50, 50], duration: 1000 });
        } else if (desviar) {
            // Se falhou ao desviar (ex: o próprio destino está dentro do bloqueio), tenta sem bloquear
            console.warn('Destino está dentro ou muito próximo da área bloqueada. Calculando rota direta...');
            buscarRotaNaAPI(origem, destino, false);
        } else {
            alert('Não foi possível calcular uma rota válida para este local.');
        }
    })
    .catch(erro => console.error('Erro ao buscar rota:', erro));
}