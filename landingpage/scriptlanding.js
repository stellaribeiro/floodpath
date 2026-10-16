// =================================================================
// CONFIGURAÇÃO DO LINK DO PROJETO EM FUNCIONAMENTO
// Quando o link mudar, altere apenas a URL abaixo!
// =================================================================
const LINK_DO_PROJETO = "http://rafaela0011.github.io/FloodPathAtualizadoOutubro/";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Funcionalidade do Acordeão FAQ
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // 2. Atualização automática dos botões para o link configurado
    const botoesProjeto = document.querySelectorAll('.link-sistema');
    botoesProjeto.forEach(botao => {
        botao.href = LINK_DO_PROJETO;
        botao.target = "_blank"; // Abre em uma nova aba
    });
});
