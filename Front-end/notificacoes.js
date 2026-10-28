/* ============================================================
   NOTIFICACOES.JS - Gestão de Alertas com Filtro Anti-Spam
   ============================================================ */

window.CONFIG_NOTIFICACOES = {
    ativa: localStorage.getItem('floodpath_notif_ativa') === 'true',
    cristo: localStorage.getItem('floodpath_notif_cristo') !== 'false',
    sesc: localStorage.getItem('floodpath_notif_sesc') !== 'false'
};

let eventSource = null;

// Memória para evitar disparos repetidos de notificações push
const ultimasNotificacoesDisparadas = {
    CRISTO: { status: null, timestamp: 0 },
    SESC: { status: null, timestamp: 0 }
};

async function solicitarPermissaoNotificacao() {
    if (!('Notification' in window)) {
        alert('Este navegador não suporta notificações de sistema.');
        return false;
    }
    if (Notification.permission === 'granted') {
        return true;
    }
    if (Notification.permission !== 'denied') {
        const permissao = await Notification.requestPermission();
        return permissao === 'granted';
    }
    alert('As notificações estão bloqueadas nas configurações do seu navegador.');
    return false;
}

async function salvarPreferenciasNotificacao(event) {
    const chkMain = document.getElementById('chk-ativar-notif');
    const chkCristo = document.getElementById('chk-notif-cristo');
    const chkSesc = document.getElementById('chk-notif-sesc');
    const painel = document.getElementById('painel-regioes-notif');

    if (!chkMain) return;

    const targetId = event && event.target ? event.target.id : null;
    let estaAtivo = chkMain.checked;

    if (targetId === 'chk-ativar-notif' && estaAtivo) {
        if ('Notification' in window && Notification.permission !== 'granted') {
            const permitida = await solicitarPermissaoNotificacao();
            if (!permitida) {
                estaAtivo = false;
                chkMain.checked = false;
            }
        }

        if (estaAtivo) {
            if (chkCristo) chkCristo.checked = true;
            if (chkSesc) chkSesc.checked = true;
        }
    } else if (estaAtivo && 'Notification' in window && Notification.permission !== 'granted') {
        const permitida = await solicitarPermissaoNotificacao();
        if (!permitida) {
            estaAtivo = false;
            chkMain.checked = false;
        }
    }

    const cristoAtivo = chkCristo ? chkCristo.checked : true;
    const sescAtivo = chkSesc ? chkSesc.checked : true;

    window.CONFIG_NOTIFICACOES.ativa = estaAtivo;
    window.CONFIG_NOTIFICACOES.cristo = cristoAtivo;
    window.CONFIG_NOTIFICACOES.sesc = sescAtivo;

    localStorage.setItem('floodpath_notif_ativa', estaAtivo ? 'true' : 'false');
    localStorage.setItem('floodpath_notif_cristo', cristoAtivo ? 'true' : 'false');
    localStorage.setItem('floodpath_notif_sesc', sescAtivo ? 'true' : 'false');

    if (painel) {
        painel.style.display = estaAtivo ? 'flex' : 'none';
    }
}

function sincronizarTelaNotificacoes() {
    const chkMain = document.getElementById('chk-ativar-notif');
    const chkCristo = document.getElementById('chk-notif-cristo');
    const chkSesc = document.getElementById('chk-notif-sesc');
    const painel = document.getElementById('painel-regioes-notif');

    if (chkMain) chkMain.checked = window.CONFIG_NOTIFICACOES.ativa;
    if (chkCristo) chkCristo.checked = window.CONFIG_NOTIFICACOES.cristo;
    if (chkSesc) chkSesc.checked = window.CONFIG_NOTIFICACOES.sesc;

    if (painel) {
        painel.style.display = window.CONFIG_NOTIFICACOES.ativa ? 'flex' : 'none';
    }
}

function conectarStreamServidor() {
    try {
        const apiUrl = (window.CONFIG && window.CONFIG.API_URL) ? window.CONFIG.API_URL : 'http://localhost:8080/api/rios';
        if (eventSource) eventSource.close();
        eventSource = new EventSource(`${apiUrl}/stream`);

        eventSource.addEventListener('nova-leitura', function (e) {
            try {
                const leitura = JSON.parse(e.data);
                processarAlertaTempoReal(leitura);
            } catch (err) {
                console.error('Erro ao processar leitura SSE:', err);
            }
        });
    } catch (e) {
        console.warn('Servidor SSE offline ou indisponível.');
    }
}

function processarAlertaTempoReal(leitura) {
    const chkMain = document.getElementById('chk-ativar-notif');

    if (chkMain && !chkMain.checked) return;
    if (!window.CONFIG_NOTIFICACOES.ativa || localStorage.getItem('floodpath_notif_ativa') !== 'true') return;

    const rawSensorId = (leitura.sensorId || leitura.sensor_id || leitura.id || '').toString().toUpperCase();
    const rawNome = (leitura.nome || '').toString().toUpperCase();

    const eCristo = rawSensorId.includes('CRISTO') || rawSensorId === 'SENSOR_01' || rawSensorId === '1' || rawNome.includes('CRISTO');
    const eSesc = rawSensorId.includes('SESC') || rawSensorId === 'SENSOR_02' || rawSensorId === '2' || rawNome.includes('SESC');

    if (!eCristo && !eSesc) return;

    const chaveSensor = eCristo ? 'CRISTO' : 'SESC';
    const chkFiltro = document.getElementById(eCristo ? 'chk-notif-cristo' : 'chk-notif-sesc');
    if (chkFiltro && !chkFiltro.checked) return;

    const statusExibicao = (leitura.status || '').toUpperCase();
    const statusSemAcento = statusExibicao.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const eCriticoOuAtencao = statusSemAcento.includes('CRITIC') || statusSemAcento.includes('ATENC');

    if (!eCriticoOuAtencao) {
        ultimasNotificacoesDisparadas[chaveSensor].status = 'NORMAL';
        return;
    }

    const agora = Date.now();
    const ultimoRegistro = ultimasNotificacoesDisparadas[chaveSensor];
    const tempoDecorrido = agora - ultimoRegistro.timestamp;

    // Evita rajadas de notificações idênticas se não mudou de status em menos de 5 min
    if (ultimoRegistro.status === statusSemAcento && tempoDecorrido < 300000) {
        return;
    }

    ultimasNotificacoesDisparadas[chaveSensor] = { status: statusSemAcento, timestamp: agora };

    const nomeLocal = eCristo ? 'Rotatória do Cristo' : 'SESC São Carlos';
    const emoji = statusSemAcento.includes('CRITIC') ? '🚨' : '⚠️';
    const nivelTexto = leitura.nivelAgua !== undefined ? ` (Nível: ${leitura.nivelAgua}m)` : '';

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${emoji} ALERTA EM TEMPO REAL: ${nomeLocal}`, {
            body: `Atenção! O ponto ${nomeLocal} atingiu estado de ${statusExibicao}${nivelTexto}. Evite a área!`,
            icon: 'logo.png',
            badge: 'logo.png'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    sincronizarTelaNotificacoes();
    conectarStreamServidor();

    const chkMain = document.getElementById('chk-ativar-notif');
    const chkCristo = document.getElementById('chk-notif-cristo');
    const chkSesc = document.getElementById('chk-notif-sesc');

    if (chkMain) chkMain.addEventListener('change', salvarPreferenciasNotificacao);
    if (chkCristo) chkCristo.addEventListener('change', salvarPreferenciasNotificacao);
    if (chkSesc) chkSesc.addEventListener('change', salvarPreferenciasNotificacao);
});

window.salvarPreferenciasNotificacao = salvarPreferenciasNotificacao;
window.sincronizarTelaNotificacoes = sincronizarTelaNotificacoes;
window.processarAlertaTempoReal = processarAlertaTempoReal;