/* ============================================================
   HISTORICO.JS - Tabela e Gráfico do Histórico
   ============================================================ */
const API_HISTORICO_URL = (window.CONFIG && window.CONFIG.API_URL) ? window.CONFIG.API_URL : 'http://localhost:8080/api/rios';

let meuGrafico = null;
let dadosHistoricoCompletos = [];
let abaHistoricoAtiva = 'geral';

function extrairNivelNumerico(item) {
    if (!item) return 0;
    const raw = item.nivelAgua ?? item.nivel_agua ?? item.nivel ?? 0;
    if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;
    
    const limpo = String(raw).replace(/m/gi, '').replace(',', '.').trim();
    const val = parseFloat(limpo);
    return isNaN(val) ? 0 : val;
}

function extrairNivelFormatado(item) {
    const val = extrairNivelNumerico(item);
    return val > 0 ? `${val}m` : '--';
}

function obterIdentificadorSensor(item) {
    if (!item) return 'SENSOR_01';
    const raw = (item.sensorId || item.sensor_id || item.nome || '').toString().toUpperCase();
    if (raw.includes('CRISTO') || raw.includes('SENSOR_01') || raw === '1') return 'SENSOR_01';
    if (raw.includes('SESC') || raw.includes('SENSOR_02') || raw === '2') return 'SENSOR_02';
    return raw;
}

async function carregarHistorico() {
    try {
        const resposta = await fetch(API_HISTORICO_URL);

        if (resposta.ok) {
            const dados = await resposta.json();
            const lista = Array.isArray(dados) ? dados : (dados && Array.isArray(dados.content) ? dados.content : []);
            lista.sort((a, b) => (Number(b.id || 0) - Number(a.id || 0)));
            dadosHistoricoCompletos = lista;
        }
    } catch (erro) {
        console.warn("Aviso ao carregar histórico:", erro);
    } finally {
        atualizarExibicaoHistorico();
    }
}

function alternarAbaHistorico(filtro, elementoBotao) {
    abaHistoricoAtiva = filtro;

    const botoes = document.querySelectorAll('.historico-tabs .tab-btn-hist');
    botoes.forEach(btn => {
        btn.style.background = '#e2e8f0';
        btn.style.color = '#475569';
    });

    if (elementoBotao) {
        elementoBotao.style.background = '#3b82f6';
        elementoBotao.style.color = 'white';
    }

    atualizarExibicaoHistorico();
}

function filtrarDadosPorAba(dados) {
    if (abaHistoricoAtiva === 'SENSOR_01') {
        return dados.filter(item => obterIdentificadorSensor(item) === 'SENSOR_01');
    } else if (abaHistoricoAtiva === 'SENSOR_02') {
        return dados.filter(item => obterIdentificadorSensor(item) === 'SENSOR_02');
    }
    return dados;
}

function atualizarExibicaoHistorico() {
    const elTitulo = document.getElementById('titulo-historico');
    if (elTitulo) {
        if (abaHistoricoAtiva === 'SENSOR_01') elTitulo.innerText = 'Histórico - Cristo';
        else if (abaHistoricoAtiva === 'SENSOR_02') elTitulo.innerText = 'Histórico - SESC';
        else elTitulo.innerText = 'Comparativo de Leituras (Geral)';
    }

    const dadosFiltrados = filtrarDadosPorAba(dadosHistoricoCompletos);

    renderizarTabelaHistorico(dadosFiltrados.slice(0, 10));
    renderizarGraficoHistorico(dadosHistoricoCompletos);
}

function renderizarTabelaHistorico(lista) {
    const tbody = document.getElementById('tabela-historico-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 10px; color: #94a3b8;">Nenhum registo encontrado.</td></tr>';
        return;
    }

    lista.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f1f5f9';

        const idSensor = obterIdentificadorSensor(item);
        const nomeSensor = idSensor === 'SENSOR_01' ? 'Cristo' : (idSensor === 'SENSOR_02' ? 'SESC' : 'Sensor');
        const nivel = extrairNivelFormatado(item);
        
        const statusExibicao = (item.status || 'NORMAL').toUpperCase();
        const statusSemAcento = statusExibicao.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        let corStatus = '#10b981';
        if (statusSemAcento.includes('ATENC')) corStatus = '#f59e0b';
        if (statusSemAcento.includes('CRITIC')) corStatus = '#ef4444';

        tr.innerHTML = `
            <td style="padding: 6px 4px; font-weight: 600;">${nomeSensor}</td>
            <td style="padding: 6px 4px;">${nivel}</td>
            <td style="padding: 6px 4px; color: ${corStatus}; font-weight: 700;">${statusExibicao}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarGraficoHistorico(todosDados) {
    const canvas = document.getElementById('graficoHistorico');
    if (!canvas || typeof Chart === 'undefined') return;

    try {
        const ctx = canvas.getContext('2d');

        if (meuGrafico) {
            meuGrafico.destroy();
            meuGrafico = null;
        }

        let datasets = [];
        let rotulos = [];

        if (abaHistoricoAtiva === 'geral') {
            const dadosCristo = todosDados
                .filter(item => obterIdentificadorSensor(item) === 'SENSOR_01')
                .slice(0, 10)
                .reverse();

            const dadosSesc = todosDados
                .filter(item => obterIdentificadorSensor(item) === 'SENSOR_02')
                .slice(0, 10)
                .reverse();

            const maxRegistos = Math.max(dadosCristo.length, dadosSesc.length);
            for (let i = 0; i < maxRegistos; i++) {
                const item = dadosCristo[i] || dadosSesc[i];
                if (item && (item.dataHora || item.hora || item.data_hora)) {
                    const dh = item.dataHora || item.data_hora;
                    const horaStr = dh ? new Date(dh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `#${i+1}`;
                    rotulos.push(horaStr);
                } else {
                    rotulos.push(`#${i + 1}`);
                }
            }

            datasets = [
                {
                    label: 'Cristo (m)',
                    data: dadosCristo.map(item => extrairNivelNumerico(item)),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3
                },
                {
                    label: 'SESC (m)',
                    data: dadosSesc.map(item => extrairNivelNumerico(item)),
                    borderColor: '#eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3
                }
            ];

        } else {
            const dadosFiltrados = filtrarDadosPorAba(todosDados).slice(0, 10).reverse();

            rotulos = dadosFiltrados.map((item, index) => {
                const dh = item.dataHora || item.data_hora;
                if (dh) {
                    return new Date(dh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                return item.hora || `#${index + 1}`;
            });

            const eCristo = abaHistoricoAtiva === 'SENSOR_01';
            const corLinha = eCristo ? '#2563eb' : '#eab308';

            datasets = [{
                label: eCristo ? 'Nível Cristo (m)' : 'Nível SESC (m)',
                data: dadosFiltrados.map(item => extrairNivelNumerico(item)),
                borderColor: corLinha,
                backgroundColor: eCristo ? 'rgba(37, 99, 235, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }];
        }

        meuGrafico = new Chart(ctx, {
            type: 'line',
            data: { labels: rotulos, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: abaHistoricoAtiva === 'geral',
                        position: 'top',
                        labels: { boxWidth: 12, font: { size: 10 } }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        suggestedMax: 20,
                        grid: { color: '#f1f5f9' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    } catch (e) {
        console.warn("Erro ao renderizar gráfico:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    const interval = (window.CONFIG && window.CONFIG.POLLING_INTERVAL_MS) ? window.CONFIG.POLLING_INTERVAL_MS : 3000;
    setInterval(carregarHistorico, interval);
});

window.alternarAbaHistorico = alternarAbaHistorico;