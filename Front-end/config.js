/* ============================================================
   CONFIG.JS - Configurações Globais do FloodPath
   ============================================================ */
window.CONFIG = Object.freeze({
    API_URL: 'http://localhost:8080/api/rios',
    ROTAS_API_URL: 'http://localhost:8080/api/rotas', 
    ORS_API_KEY: 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImIyOTM5MjhlNzFiMTRjOTM4MTA5NDhiOWNkNTliMGEwIiwiaCI6Im11cm11cjY0In0=',
    PONTO_ORIGEM_PADRAO: [-47.8972, -22.0233], // São Carlos / SP
    COORDS_CRISTO: [-47.9122, -22.0171],
    COORDS_SESC: [-47.9058, -22.0167],
    RAIO_BLOQUEIO_METROS: 250,
    POLLING_INTERVAL_MS: 3000
});

// Atalhos globais para compatibilidade direta nos outros scripts
window.COORDS_CRISTO = window.CONFIG.COORDS_CRISTO;
window.COORDS_SESC = window.CONFIG.COORDS_SESC;