/* ============================================================
   RELATORIO.JS - Gerador do Relatório Geral de Alagamentos
   ============================================================ */

async function abrirRelatorioPronto() {
    const modal = document.getElementById('modal-relatorio');
    const containerConteudo = document.getElementById('conteudo-relatorio-modal');

    if (modal) modal.style.display = 'flex';
    if (!containerConteudo) return;

    containerConteudo.innerHTML = `
        <div style="text-align:center; padding: 25px; color: #64748b;">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top: 10px; font-weight: 600;">A gerar relatório consolidado...</p>
        </div>
    `;

    try {
        // Pontos monitorizados fixos que DEVEM SEMPRE constar no relatório
        const pontosFixos = [
            { id: 'SENSOR_01', nome: 'Rotatória do Cristo' },
            { id: 'SENSOR_02', nome: 'SESC São Carlos' }
        ];

        // Tenta obter os dados do histórico na API
        const urlAPI = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:8080/api/rios';
        
        let dadosHistorico = [];
        try {
            const resp = await fetch(`${urlAPI}?limite=100`);
            if (resp.ok) {
                dadosHistorico = await resp.json();
            }
        } catch (e) {
            console.warn("Não foi possível carregar dados remotos da API:", e);
        }

        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaEmissao = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Estrutura garantida para todos os pontos
        const relatorioPorSensor = {};

        pontosFixos.forEach(ponto => {
            relatorioPorSensor[ponto.id] = {
                nome: ponto.nome,
                data: dataAtual,
                qtd: 0,
                horarios: []
            };
        });

        // Contabiliza ocorrências (ATENÇÃO ou CRÍTICO) por sensor
        if (Array.isArray(dadosHistorico)) {
            dadosHistorico.forEach(item => {
                const sId = item.sensorId || item.sensor_id;
                const status = (item.status || '').toUpperCase();

                if (relatorioPorSensor[sId] && (status === 'ATENÇÃO' || status === 'CRÍTICO' || status === 'ATENCAO' || status === 'CRITICO')) {
                    relatorioPorSensor[sId].qtd += 1;
                    
                    let horaStr = '--:--';
                    if (item.dataHora) {
                        horaStr = new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    } else if (item.hora) {
                        horaStr = item.hora;
                    } else {
                        horaStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    }

                    if (!relatorioPorSensor[sId].horarios.includes(horaStr)) {
                        relatorioPorSensor[sId].horarios.push(horaStr);
                    }
                }
            });
        }

        // Soma total de alertas no período
        let totalGeralOcorrencias = 0;
        Object.values(relatorioPorSensor).forEach(item => {
            totalGeralOcorrencias += item.qtd;
        });

        // Constrói as linhas da tabela
        let linhasTabelaHTML = '';

        pontosFixos.forEach(ponto => {
            const info = relatorioPorSensor[ponto.id];
            const temOcorrencias = info.qtd > 0;
            const horariosTexto = temOcorrencias ? info.horarios.join(', ') : 'Nenhuma ocorrência registada no período.';
            const qtdEstilo = temOcorrencias ? 'color: #ef4444; font-weight: bold;' : 'color: #10b981; font-weight: bold;';

            linhasTabelaHTML += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 8px; vertical-align: top;">
                        <strong>${info.nome}</strong>
                    </td>
                    <td style="padding: 12px 8px; vertical-align: top; text-align: center;">
                        ${info.data}
                    </td>
                    <td style="padding: 12px 8px; vertical-align: top; text-align: center; ${qtdEstilo}">
                        ${info.qtd}x
                    </td>
                    <td style="padding: 12px 8px; vertical-align: top; font-size: 0.82rem; color: ${temOcorrencias ? '#475569' : '#059669'}; max-width: 280px; word-wrap: break-word;">
                        ${horariosTexto}
                    </td>
                </tr>
            `;
        });

        containerConteudo.innerHTML = `
            <div class="relatorio-cabecalho" style="margin-bottom: 18px;">
                <h4 style="margin: 0 0 4px 0; font-size: 1.1rem; font-weight: 800; color: #0f172a;">
                    FLOODPATH - Relatório Consolidado de Inundações
                </h4>
                <p style="margin: 0; font-size: 0.8rem; color: #64748b;">
                    Emissão: ${dataAtual} às ${horaEmissao}
                </p>
            </div>

            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px;">
                <span style="color: #dc2626; font-size: 0.85rem; font-weight: 700;">
                    Total do Período: ${totalGeralOcorrencias} registo(s) de alagamento/alerta
                </span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0; color: #334155; font-size: 0.8rem; text-transform: uppercase;">
                        <th style="padding: 8px;">Ponto / Sensor</th>
                        <th style="padding: 8px; text-align: center;">Data (Dia/Mês/Ano)</th>
                        <th style="padding: 8px; text-align: center;">Qtd.</th>
                        <th style="padding: 8px;">Horários das Ocorrências</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhasTabelaHTML}
                </tbody>
            </table>
        `;

    } catch (erro) {
        console.error("Erro ao gerar relatório:", erro);
        containerConteudo.innerHTML = `
            <div style="text-align:center; padding: 20px; color: #ef4444;">
                <i class="fas fa-exclamation-circle fa-2x"></i>
                <p style="margin-top: 10px;">Erro ao carregar o relatório de alagamentos.</p>
            </div>
        `;
    }
}

function fecharModalRelatorio() {
    const modal = document.getElementById('modal-relatorio');
    if (modal) modal.style.display = 'none';
}

function fecharModalRelatorioFora(event) {
    if (event.target.id === 'modal-relatorio') {
        fecharModalRelatorio();
    }
}

// Exportações globais
window.abrirRelatorioPronto = abrirRelatorioPronto;
window.fecharModalRelatorio = fecharModalRelatorio;
window.fecharModalRelatorioFora = fecharModalRelatorioFora;