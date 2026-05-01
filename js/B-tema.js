document.addEventListener('DOMContentLoaded', () => {
    const btnTheme = document.getElementById('btnTheme');
    
    const root = document.documentElement; 

    const temaGuardado = localStorage.getItem('vacina_tema_preferencia');
    
    if (temaGuardado === 'light') {
        root.removeAttribute('data-theme');
        if (btnTheme) btnTheme.innerText = '☀️';
    } else {
        root.setAttribute('data-theme', 'dark');
        if (btnTheme) btnTheme.innerText = '🌙';
    }

    if (btnTheme) {
        btnTheme.addEventListener('click', () => {
            const isDark = root.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                root.removeAttribute('data-theme');
                btnTheme.innerText = '☀️';
                localStorage.setItem('vacina_tema_preferencia', 'light');
            } else {
                root.setAttribute('data-theme', 'dark');
                btnTheme.innerText = '🌙';
                localStorage.setItem('vacina_tema_preferencia', 'dark');
            }
        });
    }
});