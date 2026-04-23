document.addEventListener('mousemove', (e) => {
    mouseShadow.style.left = e.clientX + 'px';
    mouseShadow.style.top = e.clientY + 'px';
});

appTitle.addEventListener('click', (e) => {
    currentClicks++;
    
    if (currentClicks >= clicksNeeded) {
        const easterEmojis = ['💉', '🩹', '🦠', '💊', '🩺', '✨'];
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'flying-emoji';
                el.innerText = easterEmojis[Math.floor(Math.random() * easterEmojis.length)];
                el.style.left = e.clientX + 'px';
                el.style.top = e.clientY + 'px';
                
                const tx = (Math.random() - 0.5) * 400 + 'px';
                const ty = (Math.random() - 0.5) * 400 + 'px';
                const rot = (Math.random() - 0.5) * 180 + 'deg';
                
                el.style.setProperty('--tx', tx);
                el.style.setProperty('--ty', ty);
                el.style.setProperty('--rot', rot);
                
                document.body.appendChild(el);
                
                setTimeout(() => el.remove(), 1500);
            }, i * 50);
        }
        
        currentClicks = 0;
        clicksNeeded = Math.floor(Math.random() * 11) + 10;
    }
});