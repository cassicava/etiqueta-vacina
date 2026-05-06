(function() {
    const loginWrapper = document.getElementById('loginWrapper');
    const appContainer = document.getElementById('appContainer');
    const btnEntrar = document.getElementById('btnEntrar');
    const loginCard = document.querySelector('.login-card');
    const inputUsuario = document.getElementById('inputUsuario');
    const inputSenha = document.getElementById('inputSenha');
    const btnTermos = document.getElementById('btnTermos');
    const termosOverlay = document.getElementById('termosOverlay');
    const btnFecharTermos = document.getElementById('btnFecharTermos');
    const appHeader = document.getElementById('appHeader');
    const welcomeMsg = document.getElementById('welcomeMsg');
    const headerCenterArea = document.getElementById('headerCenterArea');
    const headerActions = document.getElementById('headerActions'); 
    const btnSair = document.getElementById('btnSair');
    const btnEsqueci = document.getElementById('btnEsqueci');
    const balaoEsqueci = document.getElementById('balaoEsqueci');

    const TEMPO_SESSAO_MINUTOS = 10;
    const now = Date.now();
    const sessaoExpiraEm = localStorage.getItem('lf_sessao_expira_vacina');

    function iniciarSistema() {
        appContainer.classList.remove('app-hidden');
        setTimeout(() => {
            appContainer.classList.add('active-layout');
            if(typeof renderizarLista === 'function') {
                renderizarLista();
            }
            
            const btnViewVacinas = document.getElementById('btnViewVacinas');
            const viewToggleBg = document.getElementById('viewToggleBg');
            if (btnViewVacinas && viewToggleBg) {
                viewToggleBg.style.width = btnViewVacinas.offsetWidth + 'px';
                viewToggleBg.style.left = btnViewVacinas.offsetLeft + 'px';
            }

            if (typeof window.verificarEIniciarOnboarding === 'function') {
                window.verificarEIniciarOnboarding();
            }

            if (typeof window.verificarLembreteBackup === 'function') {
                window.verificarLembreteBackup();
            }
        }, 100);
    }

    if (sessaoExpiraEm && now < parseInt(sessaoExpiraEm)) {
        localStorage.setItem('lf_sessao_expira_vacina', now + (TEMPO_SESSAO_MINUTOS * 60 * 1000));
        
        let acessos = parseInt(localStorage.getItem('vacina_contador_acessos') || '0');
        acessos++;
        localStorage.setItem('vacina_contador_acessos', acessos.toString());
        
        appHeader.style.transition = 'none';
        if (headerActions) headerActions.style.transition = 'none'; 
        
        appHeader.classList.add('move-top', 'header-ready', 'logged-in');
        if (headerActions) headerActions.classList.add('visible'); 
        if (headerCenterArea) headerCenterArea.classList.add('active');
        
        loginWrapper.style.display = 'none';
        iniciarSistema();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                appHeader.style.transition = '';
                if (headerActions) headerActions.style.transition = '';
            });
        });
    } else {
        setTimeout(() => {
            appHeader.classList.add('move-top');
            setTimeout(() => {
                appHeader.classList.add('header-ready'); 
                if(headerActions) headerActions.classList.add('visible'); 
                loginWrapper.classList.add('visible');
            }, 1200); 
        }, 500); 
    }

    const inputsLogin = loginWrapper.querySelectorAll('input');
    inputsLogin.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                btnEntrar.click();
            }
        });
    });

    function processarEntrada(genero, nomeDisplay) {
        appHeader.classList.add('logged-in');
        loginWrapper.style.opacity = '0';
        loginWrapper.style.pointerEvents = 'none';
        setTimeout(() => loginWrapper.style.display = 'none', 600);

        welcomeMsg.innerText = genero === 'F' ? `Bem-vinda, ${nomeDisplay}! ✨` : `Bem-vindo, ${nomeDisplay}! ✨`;

        setTimeout(() => {
            welcomeMsg.classList.add('show');
            setTimeout(() => {
                welcomeMsg.classList.remove('show');
                setTimeout(() => {
                    if(headerCenterArea) headerCenterArea.classList.add('active');
                    if(headerActions) headerActions.classList.add('visible');
                }, 400); 
            }, 2000); 
        }, 800);

        iniciarSistema();
    }

    btnEntrar.addEventListener('click', (e) => {
        e.preventDefault();
        
        const userDigitado = inputUsuario.value.trim().toLowerCase();
        const senhaDigitada = inputSenha.value.trim();

        const usuarioValido = typeof usuariosHabilitados !== 'undefined' ? usuariosHabilitados.find(
            u => u.usuario === userDigitado && u.senha === senhaDigitada
        ) : null;

        const senhaTem6Digitos = senhaDigitada.length === 6;

        if (usuarioValido && senhaTem6Digitos) {
            localStorage.setItem('lf_sessao_expira_vacina', Date.now() + (TEMPO_SESSAO_MINUTOS * 60 * 1000));
            localStorage.setItem('lf_genero_usuario_vacina', usuarioValido.genero);
            
            const nomeFormatado = usuarioValido.usuario.charAt(0).toUpperCase() + usuarioValido.usuario.slice(1);
            localStorage.setItem('lf_nome_usuario_vacina', nomeFormatado); 

            let acessos = parseInt(localStorage.getItem('vacina_contador_acessos') || '0');
            acessos++;
            localStorage.setItem('vacina_contador_acessos', acessos.toString());

            processarEntrada(usuarioValido.genero, nomeFormatado);
        } else {
            loginCard.classList.remove('login-error');
            void loginCard.offsetWidth; 
            loginCard.classList.add('login-error');
        }
    });

    if (btnEsqueci && balaoEsqueci) {
        btnEsqueci.addEventListener('click', (e) => {
            e.preventDefault();
            balaoEsqueci.classList.toggle('mostrar');
            
            if (balaoEsqueci.classList.contains('mostrar')) {
                setTimeout(() => {
                    balaoEsqueci.classList.remove('mostrar');
                }, 6000);
            }
        });
    }

    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.removeItem('lf_sessao_expira_vacina');
            localStorage.removeItem('lf_genero_usuario_vacina');
            localStorage.removeItem('lf_nome_usuario_vacina');
            
            appContainer.classList.remove('active-layout');
            setTimeout(() => {
                appContainer.classList.add('app-hidden');
                if (typeof contentArea !== 'undefined') contentArea.innerHTML = '';
                const rotinasArea = document.getElementById('rotinasArea');
                if (rotinasArea) rotinasArea.innerHTML = '';
            }, 400);

            appHeader.classList.remove('logged-in'); 
            if(headerCenterArea) headerCenterArea.classList.remove('active');

            setTimeout(() => {
                loginWrapper.style.display = 'flex';
                void loginWrapper.offsetWidth; 
                loginWrapper.style.opacity = '1';
                loginWrapper.style.pointerEvents = 'auto';
                inputSenha.value = ''; 
            }, 600); 
        });
    }

    if (btnTermos) {
        btnTermos.addEventListener('click', () => {
            termosOverlay.classList.add('open');
        });
    }

    if (btnFecharTermos) {
        btnFecharTermos.addEventListener('click', () => {
            termosOverlay.classList.remove('open');
        });
    }

    if (termosOverlay) {
        termosOverlay.addEventListener('click', (e) => {
            if (e.target === termosOverlay) termosOverlay.classList.remove('open');
        });
    }
})();