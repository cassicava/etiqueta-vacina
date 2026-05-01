window.verificarEIniciarOnboarding = function() {
    const nomeUsuario = localStorage.getItem('lf_nome_usuario_vacina') || 'padrao';
    const chaveTutorial = 'tutorial_visto_' + nomeUsuario.toLowerCase();
    const overlay = document.getElementById('onboardingOverlay');

    if (!overlay) return;

    if (localStorage.getItem(chaveTutorial) === 'true') {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        return;
    }

    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);

    const onboardingData = [
        { 
            icone: "👋", 
            titulo: "Bem-vindo!", 
            texto: "Este sistema foi criado para formatar e gerar impressões de registros de dose (carimbos) de forma rápida." 
        },
        { 
            icone: "💉", 
            titulo: "Vacinas e Rotinas", 
            texto: "Cadastre as vacinas com siglas curtas e use a aba Rotinas para agrupar aplicações frequentes por idade." 
        },
        { 
            icone: "🖨️", 
            titulo: "Impressão Perfeita", 
            texto: "Regra de ouro: na hora de imprimir, certifique-se que a Escala está em 100% ou Tamanho Real. Use uma régua para configurar as medidas." 
        },
        { 
            icone: "💾", 
            titulo: "Privacidade Total", 
            texto: "Seus dados ficam salvos apenas na memória do seu navegador. Lembre-se de usar o botão de Exportar Backup regularmente!" 
        }
    ];

    let etapaAtual = 0;
    let timer;
    const tempoEtapa = 5000;

    const progressContainer = document.getElementById('onboardingProgressContainer');
    const content = document.getElementById('onboardingContent');
    const iconEl = document.getElementById('onboardingIcon');
    const titleEl = document.getElementById('onboardingTitle');
    const textEl = document.getElementById('onboardingText');
    let btnStart = document.getElementById('btnOnboardingStart');

    btnStart.classList.remove('active');

    const novoBtnStart = btnStart.cloneNode(true);
    btnStart.parentNode.replaceChild(novoBtnStart, btnStart);
    btnStart = novoBtnStart;

    function criarBarras() {
        progressContainer.innerHTML = '';
        onboardingData.forEach((_, index) => {
            const bar = document.createElement('div');
            bar.className = 'onboarding-progress-bar';
            
            const fill = document.createElement('div');
            fill.className = 'onboarding-progress-fill';
            fill.id = `onboarding-fill-${index}`;
            
            bar.appendChild(fill);
            progressContainer.appendChild(bar);
        });
    }

    function atualizarBarras() {
        onboardingData.forEach((_, index) => {
            const fill = document.getElementById(`onboarding-fill-${index}`);
            fill.style.transition = 'none';
            
            if (index < etapaAtual) {
                fill.style.width = '100%';
            } else if (index === etapaAtual) {
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.transition = `width ${tempoEtapa}ms linear`;
                    fill.style.width = '100%';
                }, 50);
            } else {
                fill.style.width = '0%';
            }
        });
    }

    function renderOnboarding() {
        clearTimeout(timer);
        atualizarBarras();

        const dados = onboardingData[etapaAtual];
        iconEl.textContent = dados.icone;
        titleEl.textContent = dados.titulo;
        textEl.textContent = dados.texto;

        if (etapaAtual < onboardingData.length - 1) {
            timer = setTimeout(() => {
                avancarEtapa();
            }, tempoEtapa);
        } else {
            timer = setTimeout(() => {
                btnStart.classList.add('active');
            }, tempoEtapa);
        }
    }

    function avancarEtapa() {
        content.classList.add('fade-out');
        setTimeout(() => {
            etapaAtual++;
            renderOnboarding();
            content.classList.remove('fade-out');
        }, 300);
    }

    btnStart.addEventListener('click', () => {
        localStorage.setItem(chaveTutorial, 'true');
        overlay.classList.remove('active');
        clearTimeout(timer);
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    });

    criarBarras();
    renderOnboarding();
};