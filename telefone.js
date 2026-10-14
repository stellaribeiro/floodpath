/* ============================================================
   TELEFONE.JS - Menu e Simulação de Chamada de Emergência
   ============================================================ */

let sosInterval;
let sosTimerInterval;

function toggleMenuSOS(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('menu-sos');
    if (!menu) return;

    const estaVisivel = menu.style.display === 'flex';
    menu.style.display = estaVisivel ? 'none' : 'flex';
}

function iniciarChamadaSOS(servico, numero) {
    const menu = document.getElementById('menu-sos');
    if (menu) menu.style.display = 'none';

    const modalSos = document.getElementById('sos-modal');
    const callerNameEl = document.getElementById('sos-caller-name');
    const statusEl = document.getElementById('sos-status');
    const timerEl = document.getElementById('sos-timer');

    if (!modalSos) return;

    if (callerNameEl) {
        callerNameEl.innerText = `${servico} (${numero})`;
    }

    modalSos.classList.add('active');
    statusEl.style.display = 'block';
    statusEl.innerText = "ligando...";
    timerEl.style.display = 'none';
    timerEl.innerText = "00:00";

    let seconds = 0;

    clearTimeout(sosInterval);
    clearInterval(sosTimerInterval);

    sosInterval = setTimeout(() => {
        statusEl.style.display = 'none';
        timerEl.style.display = 'block';

        sosTimerInterval = setInterval(() => {
            seconds++;
            let mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            let secs = (seconds % 60).toString().padStart(2, '0');
            timerEl.innerText = `${mins}:${secs}`;
        }, 1000);

    }, 2500);
}

document.addEventListener('DOMContentLoaded', function () {
    const btnCancel = document.getElementById('btn-cancel-sos');

    if (btnCancel) {
        btnCancel.addEventListener('click', function () {
            const modalSos = document.getElementById('sos-modal');
            if (modalSos) modalSos.classList.remove('active');

            clearTimeout(sosInterval);
            clearInterval(sosTimerInterval);
        });
    }

    document.addEventListener('click', function (e) {
        const menu = document.getElementById('menu-sos');
        const btnSos = document.querySelector('.btn-sos');
        if (menu && !menu.contains(e.target) && btnSos && !btnSos.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
});

window.toggleMenuSOS = toggleMenuSOS;
window.iniciarChamadaSOS = iniciarChamadaSOS;