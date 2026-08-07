document.addEventListener('DOMContentLoaded', function () {
            const btnSos = document.querySelector('.btn-sos');
            const modalSos = document.getElementById('sos-modal');
            const btnCancel = document.getElementById('btn-cancel-sos');
            const statusEl = document.getElementById('sos-status');
            const timerEl = document.getElementById('sos-timer');
            let sosInterval;

            btnSos.addEventListener('click', function () {
                modalSos.classList.add('active');
                
                // Reseta para o comportamento inicial do iPhone
                statusEl.style.display = 'block';
                statusEl.innerText = "ligando...";
                timerEl.style.display = 'none';
                timerEl.innerText = "00:00";

                let seconds = 0;

                // Simula o tempo de linha completando (após 2.5 segundos, a chamada atende)
                sosInterval = setTimeout(() => {
                    statusEl.style.display = 'none'; // Esconde o texto "ligando..."
                    timerEl.style.display = 'block'; // Mostra o cronômetro correndo

                    // Inicia a contagem do tempo da chamada de emergência
                    sosInterval = setInterval(() => {
                        seconds++;
                        let mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                        let secs = (seconds % 60).toString().padStart(2, '0');
                        timerEl.innerText = `${mins}:${secs}`;
                    }, 1000);

                }, 2500); 
            });

            btnCancel.addEventListener('click', function () {
                modalSos.classList.remove('active');
                clearInterval(sosInterval);
                clearTimeout(sosInterval);
            });
        });