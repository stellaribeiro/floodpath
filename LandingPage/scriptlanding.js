// Link do sistema em funcionamento (atualiza todos os botões .link-sistema)
const LINK_DO_PROJETO = "https://rafaela0011.github.io/FloodPathAtualizadoOutubro/";

const ETAPAS = [
    { imagem: "inicio.webp", titulo: "Base e relevo", texto: "Preparação da base, modelagem do relevo e delimitação inicial do espaço utilizando massa e materiais base.", alt: "Início da maquete: base de madeira com terra, massa azul modelando o relevo e uma ilha circular ao centro" },
    { imagem: "meio.webp", titulo: "Pintura e canal", texto: "Pintura base inicial, texturização do terreno e demarcação das áreas por onde a água vai passar.", alt: "Maquete pintada de verde e preto, com o canal de água em branco e uma ilha de espuma ao centro" },
    { imagem: "meio2.webp", titulo: "Texturas e rio", texto: "Adição de texturas detalhadas, aplicação de musgos e aprimoramento das cores do rio.", alt: "Maquete com o rio pintado de azul, margens cobertas de musgo e uma ilha de musgo verde ao centro" },
    { imagem: "fim.webp", titulo: "Vegetação e acabamento", texto: "Finalização da maquete com a cobertura completa de vegetação e acabamentos reais do terreno.", alt: "Vista de cima da maquete finalizada, com musgo cobrindo o terreno, rio escuro e duas pontes pretas" }
];

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".link-sistema").forEach(a => {
        a.href = LINK_DO_PROJETO;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
    });

    const reveals = document.querySelectorAll(".feature-card, .step-card, .team-card");
    reveals.forEach(el => el.classList.add("reveal"));

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => revealOnScroll.observe(el));

    const phoneFrame = document.querySelector(".phone-frame") || document.querySelector(".celular");
    if (phoneFrame) {
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        const animatePhone = () => {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            phoneFrame.style.transform = `rotateY(${currentX}deg) rotateX(${currentY}deg)`;
            requestAnimationFrame(animatePhone);
        };

        document.addEventListener("mousemove", (e) => {
            targetX = (e.clientX - window.innerWidth / 2) / 28;
            targetY = (e.clientY - window.innerHeight / 2) / -28;
        });

        requestAnimationFrame(animatePhone);
    }

    iniciarRegua();
    iniciarModal();
    iniciarMaquete();
});

// A régua de nível sobe conforme a página é lida
function iniciarRegua() {
    const raiz = document.documentElement;
    let agendado = false;
    const atualizar = () => {
        const max = raiz.scrollHeight - window.innerHeight;
        const nivel = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        raiz.style.setProperty("--nivel", nivel.toFixed(3));
        agendado = false;
    };
    window.addEventListener("scroll", () => {
        if (!agendado) { agendado = true; requestAnimationFrame(atualizar); }
    }, { passive: true });
    window.addEventListener("resize", atualizar);
    atualizar();
}

// Ampliar imagens (casos reais e maquete)
function iniciarModal() {
    const modal = document.getElementById("modal-imagem");
    const img = document.getElementById("modal-img");
    if (!modal || !img || !modal.showModal) return;

    document.addEventListener("click", e => {
        const gatilho = e.target.closest(".ampliar");
        const origem = gatilho && gatilho.querySelector("img");
        if (!origem) return;
        img.src = origem.currentSrc || origem.src;
        img.alt = origem.alt;
        modal.showModal();
    });
    modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });
    modal.querySelector(".modal-fechar").addEventListener("click", () => modal.close());
}

// Etapas da maquete (manual: setas e lista de etapas)
function iniciarMaquete() {
    const img = document.getElementById("maquete-img");
    const titulo = document.getElementById("maquete-title");
    const texto = document.getElementById("maquete-description");
    const botoes = [...document.querySelectorAll(".etapa")];
    if (!img || !titulo || !texto) return;

    let atual = 0;
    let troca;
    ETAPAS.forEach(e => { new Image().src = e.imagem; });

    function mostrar(i) {
        atual = (i + ETAPAS.length) % ETAPAS.length;
        const etapa = ETAPAS[atual];
        img.style.opacity = 0;
        clearTimeout(troca);
        troca = setTimeout(() => {
            img.src = etapa.imagem;
            img.alt = etapa.alt;
            img.style.opacity = 1;
        }, 180);
        botoes.forEach((b, n) => b.setAttribute("aria-current", n === atual ? "true" : "false"));
        titulo.textContent = etapa.titulo;
        texto.textContent = etapa.texto;
    }

    document.querySelector(".seta-esq").addEventListener("click", () => mostrar(atual - 1));
    document.querySelector(".seta-dir").addEventListener("click", () => mostrar(atual + 1));
    botoes.forEach((b, n) => b.addEventListener("click", () => mostrar(n)));
}