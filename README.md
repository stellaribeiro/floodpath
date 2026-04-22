# FloodPath

Nome do projeto:
Flood Path

Nome da equipe:
Nexus Four Integrantes: Stella Ribeiro | Analista e Desing, Rafaela Alves | Full Stack, Nathan Pereira | Banco, Ryan Silva | Líder e Back-end. 
Descrição: Plataforma digital dedicada ao monitoramento em tempo real de pontos de alagamento e áreas com risco iminente de inundação na cidade.

Objetivos:
O objetivo do FloodPath é informar a população sobre quais pontos da cidade estão alagados, permitindo que as pessoas circulem com segurança e não corram o risco de ficarem ilhadas.

Tecnologias Utilizadas:
HTML, CSS, Banco de Dados, API + Java,  Arduino e sensores.

Dores do cliente: 
É a vulnerabilidade . O Cliente vive sob a tensão constante de perder seu principal meio de transporte (o carro) e ter sua rotina produtiva interrompida pelo ilhamento . Para ela, a enchente não é apenas um aspecto natural, mas um obstáculo que gera ansiedade emocional , prejuízo financeiro iminente e a frustração de não ter controle sobre seu próprio tempo e segurança ao se deslocar por São Carlos.

Persona:
Carla Mendes, de 34 anos é assistente administrativa e tem uma rotina muito corrida, costuma ir sempre ao shopping para pois é perto de seu serviço na cidade de São Carlos, ela usa seu próprio carro pra se locomover e sempre pesquisa em sites o clima pois odeia chuva. Em um dia comum em seu horário de almoço, Carla estava indo ao shopping da cidade e o céu estava se fechando, para evitar alagamentos futuros Carla utilizou o site FloodPath, o site avisou que o shopping iria alagar por volta das 15h, alertando sobre possível ilhamento naquele local durante aquele período.

Descrição do funcionamento(Sujeito a modificações):
1. Detecção em Campo (Hardware)
O monitoramento começa nos pontos críticos da cidade, onde unidades com Arduino estão instaladas.
O Sensor e a Boia: A boia de água atua como um interruptor físico de alta precisão. Conforme o nível da água sobe em bueiros ou canais, a boia se desloca. Ao atingir uma altura pré-determinada, ela aciona o sensor, enviando um sinal elétrico imediato para o Arduino.

Processamento e Inteligência (Backend):
Assim que o Arduino detecta a subida da boia, ele envia esse dado para uma API desenvolvida em Java.
O Papel do Java: Este "cérebro" do sistema recebe os alertas de centenas de sensores simultaneamente. Ele valida a informação e a registra no Banco de Dados, criando um histórico em tempo real de quais ruas estão ficando intransitáveis.

Visualização e Alerta (Frontend):
A camada final é onde o usuário interage com a solução através de uma interface intuitiva feita em HTML e CSS.
O Mapa de Risco: O sistema consome os dados do banco e atualiza o mapa automaticamente. Se a boia de um bueiro subiu, o ponto correspondente no site muda de cor (ex: de verde para vermelho), avisando a população que aquele local oferece risco de alagamento.

LINK Kanban: https://trello.com/invite/b/69c3c228687ddd7a668e7afd/ATTI1d07ded55f05020e8edd83f9ef8b0bb7CE2E105C/kanbanfloodpath

LINK Figma: https://www.figma.com/site/hIjTlZDOEFOgDD40PBg2KJ/Sem-t%C3%ADtulo?node-id=0-1&p=f&t=9Jf4gS7fDOxda0gN-0

LINK Principais pontos de alagamentos em São Carlos: https://tietejacare.com.br/wp-content/uploads/2024/07/Mapeamento-de-Areas-de-Alto-e-Muito-Alto-Risco-a-Deslizamentos-e-Inundacoes-Sao-Carlos-SP.pdf
