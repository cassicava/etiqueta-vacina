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
        }, 100);
    }

    if (sessaoExpiraEm && now < parseInt(sessaoExpiraEm)) {
        localStorage.setItem('lf_sessao_expira_vacina', now + (TEMPO_SESSAO_MINUTOS * 60 * 1000));
        
        const generoSalvo = localStorage.getItem('lf_genero_usuario_vacina') || 'M';
        welcomeMsg.innerText = generoSalvo === 'F' ? 'Bem-vinda! ✨' : 'Bem-vindo! ✨';

        appHeader.style.transition = 'none';
        headerActions.style.transition = 'none'; 
        
        appHeader.classList.add('move-top', 'header-ready', 'logged-in');
        headerActions.classList.add('visible'); 
        
        loginWrapper.style.display = 'none';
        iniciarSistema();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                appHeader.style.transition = '';
                headerActions.style.transition = '';
            });
        });
    } else {
        setTimeout(() => {
            appHeader.classList.add('move-top');
            setTimeout(() => {
                appHeader.classList.add('header-ready'); 
                headerActions.classList.add('visible'); 
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
            localStorage.setItem('lf_nome_usuario_vacina', usuarioValido.usuario); // Salva o nome para o PDF

            welcomeMsg.innerText = usuarioValido.genero === 'F' ? 'Bem-vinda! ✨' : 'Bem-vindo! ✨';

            loginWrapper.style.opacity = '0';
            loginWrapper.style.pointerEvents = 'none';
            
            setTimeout(() => {
                loginWrapper.style.display = 'none';
                appHeader.classList.add('logged-in'); 
                
                setTimeout(() => {
                    welcomeMsg.classList.add('show');
                    setTimeout(() => {
                        welcomeMsg.classList.remove('show');
                    }, 2500); 
                }, 800);

                iniciarSistema();
            }, 600);
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
            }, 400);

            appHeader.classList.remove('logged-in'); 

            setTimeout(() => {
                loginWrapper.style.display = 'flex';
                void loginWrapper.offsetWidth; 
                loginWrapper.style.opacity = '1';
                loginWrapper.style.pointerEvents = 'auto';
                inputSenha.value = ''; 
            }, 600); 
        });
    }

    btnTermos.addEventListener('click', () => {
        termosOverlay.classList.add('open');
    });

    btnFecharTermos.addEventListener('click', () => {
        termosOverlay.classList.remove('open');
    });

    termosOverlay.addEventListener('click', (e) => {
        if (e.target === termosOverlay) termosOverlay.classList.remove('open');
    });
})();