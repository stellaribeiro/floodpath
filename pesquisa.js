/* ============================================================
   PESQUISA.JS - Sugestões e Autocompletar de Rotas (Estilo Waze)
   ============================================================ */

const ORS_API_KEY_PESQUISA = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImIyOTM5MjhlNzFiMTRjOTM4MTA5NDhiOWNkNTliMGEwIiwiaCI6Im11cm11cjY0In0='; 

let debounceTimer = null;

function buscarSugestoes(texto) {
    clearTimeout(debounceTimer);
    const containerSuggestions = document.getElementById('suggestions-box');
    
    if (!texto || texto.trim().length < 3) {
        if (containerSuggestions) containerSuggestions.style.display = 'none';
        return;
    }

    // Debounce de 300ms para evitar requisições excessivas
    debounceTimer = setTimeout(async () => {
        const apiKey = window.ORS_API_KEY || ORS_API_KEY_PESQUISA;
        const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(texto)}&boundary.rect=-48.00,-22.10,-47.80,-21.90`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.features && data.features.length > 0) {
                renderizarSugestoes(data.features);
            } else {
                if (containerSuggestions) containerSuggestions.style.display = 'none';
            }
        } catch (err) {
            console.error('Erro ao buscar sugestões:', err);
        }
    }, 300);
}

function renderizarSugestoes(locais) {
    const containerSuggestions = document.getElementById('suggestions-box');
    if (!containerSuggestions) return;

    containerSuggestions.innerHTML = '';
    containerSuggestions.style.display = 'block';

    locais.slice(0, 5).forEach(local => {
        const name = local.properties.name || local.properties.label;
        const region = local.properties.region || local.properties.locality || 'São Carlos';
        const coords = local.geometry.coordinates;

        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <div class="suggestion-info">
                <span class="suggestion-title">${name}</span>
                <span class="suggestion-subtitle">${region}</span>
            </div>
        `;

        item.onclick = () => {
            const inputDestino = document.getElementById('destination');
            if (inputDestino) inputDestino.value = name;
            
            containerSuggestions.style.display = 'none';
            
            // Define o destino e chama a verificação do mapa.js
            window.destinoAtualCoordenadas = coords;
            if (typeof window.processarRotaComSeguranca === 'function') {
                window.processarRotaComSeguranca(coords, name);
            }
        };

        containerSuggestions.appendChild(item);
    });
}

// Oculta a caixa de sugestões se o usuário clicar fora dela
document.addEventListener('click', (e) => {
    const containerSuggestions = document.getElementById('suggestions-box');
    const inputDestino = document.getElementById('destination');
    
    if (containerSuggestions && e.target !== inputDestino && !containerSuggestions.contains(e.target)) {
        containerSuggestions.style.display = 'none';
    }
});

window.buscarSugestoes = buscarSugestoes;