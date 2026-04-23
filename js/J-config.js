const inputsCfg = {
    pageWidth: document.getElementById('cfgPageWidth'),
    pageHeight: document.getElementById('cfgPageHeight'),
    cols: document.getElementById('cfgCols'),
    rows: document.getElementById('cfgRows'),
    gapX: document.getElementById('cfgGapX'),
    gapY: document.getElementById('cfgGapY'),
    marginTop: document.getElementById('cfgMarginTop'),
    marginBottom: document.getElementById('cfgMarginBottom'),
    marginLeft: document.getElementById('cfgMarginLeft'),
    marginRight: document.getElementById('cfgMarginRight'),
    labelWidth: document.getElementById('cfgLabelWidth'),
    labelHeight: document.getElementById('cfgLabelHeight'),
    
    padTop: document.getElementById('cfgPadTop'),
    padBottom: document.getElementById('cfgPadBottom'),
    padLeft: document.getElementById('cfgPadLeft'),
    padRight: document.getElementById('cfgPadRight'),

    doseCols: document.getElementById('cfgDoseCols'),
    doseRows: document.getElementById('cfgDoseRows'),
    doseGapX: document.getElementById('cfgDoseGapX'),
    doseGapY: document.getElementById('cfgDoseGapY'),
    doseWidth: document.getElementById('cfgDoseWidth'),
    doseHeight: document.getElementById('cfgDoseHeight')
};

const camposCm = [
    'pageWidth', 'pageHeight', 'gapX', 'gapY',
    'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'labelWidth', 'labelHeight', 
    'padTop', 'padBottom', 'padLeft', 'padRight',
    'doseGapX', 'doseGapY', 'doseWidth', 'doseHeight'
];

const previewPage = document.getElementById('previewPage');
const previewLabel = document.getElementById('previewLabel');
const previewPageWrapper = document.getElementById('previewPageWrapper');
const previewLabelWrapper = document.getElementById('previewLabelWrapper');
const btnSalvarConfig = document.getElementById('btnSalvarConfig');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabBg = document.getElementById('tabActiveBg');

function moveTabBg(tabElement) {
    if(!tabElement) return;
    tabBg.style.width = tabElement.offsetWidth + 'px';
    tabBg.style.left = tabElement.offsetLeft + 'px';
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        const targetId = e.target.getAttribute('data-tab');
        e.target.classList.add('active');
        document.getElementById(targetId).classList.add('active');
        moveTabBg(e.target);
    });
});

function carregarConfiguracoes() {
    const saved = localStorage.getItem('vacina_config_impressao');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            configImpresso = { ...configImpresso, ...parsed };
        } catch(e) {}
    }

    for (let key in inputsCfg) {
        if (inputsCfg[key]) {
            if (camposCm.includes(key)) {
                inputsCfg[key].value = configImpresso[key].toFixed(1);
            } else {
                inputsCfg[key].value = configImpresso[key];
            }
        }
    }
    atualizarPreview();
}

function setInputError(ids, condition) {
    ids.forEach(id => {
        const el = document.getElementById('ctrl' + id.replace('cfg', ''));
        if (el) {
            if (condition) el.classList.add('input-error-pulse');
            else el.classList.remove('input-error-pulse');
        }
    });
}

function atualizarPreview() {
    const cfgUser = {};
    for (let key in inputsCfg) {
        cfgUser[key] = parseFloat(inputsCfg[key].value) || 0;
    }

    const reqLabelW = cfgUser.marginLeft + cfgUser.marginRight + (cfgUser.cols * cfgUser.labelWidth) + (Math.max(0, cfgUser.cols - 1) * cfgUser.gapX);
    const reqLabelH = cfgUser.marginTop + cfgUser.marginBottom + (cfgUser.rows * cfgUser.labelHeight) + (Math.max(0, cfgUser.rows - 1) * cfgUser.gapY);
    
    const availableLabelW = cfgUser.labelWidth - cfgUser.padLeft - cfgUser.padRight;
    const availableLabelH = cfgUser.labelHeight - cfgUser.padTop - cfgUser.padBottom;

    const reqDoseW = (cfgUser.doseCols * cfgUser.doseWidth) + (Math.max(0, cfgUser.doseCols - 1) * cfgUser.doseGapX);
    const reqDoseH = (cfgUser.doseRows * cfgUser.doseHeight) + (Math.max(0, cfgUser.doseRows - 1) * cfgUser.doseGapY);

    const errPageW = reqLabelW > cfgUser.pageWidth;
    const errPageH = reqLabelH > cfgUser.pageHeight;
    const errDoseW = reqDoseW > availableLabelW;
    const errDoseH = reqDoseH > availableLabelH;

    document.querySelectorAll('.number-control').forEach(el => el.classList.remove('input-error-pulse'));

    if (errPageW) setInputError(['cfgPageWidth', 'cfgCols', 'cfgLabelWidth', 'cfgGapX', 'cfgMarginLeft', 'cfgMarginRight'], true);
    if (errPageH) setInputError(['cfgPageHeight', 'cfgRows', 'cfgLabelHeight', 'cfgGapY', 'cfgMarginTop', 'cfgMarginBottom'], true);
    if (errDoseW) setInputError(['cfgLabelWidth', 'cfgPadLeft', 'cfgPadRight', 'cfgDoseCols', 'cfgDoseWidth', 'cfgDoseGapX'], true);
    if (errDoseH) setInputError(['cfgLabelHeight', 'cfgPadTop', 'cfgPadBottom', 'cfgDoseRows', 'cfgDoseHeight', 'cfgDoseGapY'], true);

    const hasError = errPageW || errPageH || errDoseW || errDoseH;

    btnSalvarConfig.disabled = hasError;
    btnSalvarConfig.style.opacity = hasError ? '0.5' : '1';
    btnSalvarConfig.style.cursor = hasError ? 'not-allowed' : 'pointer';

    const pWrapperW = previewPageWrapper.clientWidth - 20;
    const pWrapperH = previewPageWrapper.clientHeight - 20; 
    let pageScale = Math.min(pWrapperW / cfgUser.pageWidth, pWrapperH / cfgUser.pageHeight);
    if (isNaN(pageScale) || pageScale <= 0 || !isFinite(pageScale)) pageScale = 1;
    
    previewPage.style.width = `${cfgUser.pageWidth * pageScale}px`;
    previewPage.style.height = `${cfgUser.pageHeight * pageScale}px`;
    previewPage.innerHTML = ''; 

    const marginBox = document.createElement('div');
    marginBox.style.position = 'absolute';
    marginBox.style.border = '1px dashed rgba(239, 68, 68, 0.6)';
    marginBox.style.pointerEvents = 'none';
    marginBox.style.top = `${cfgUser.marginTop * pageScale}px`;
    marginBox.style.left = `${cfgUser.marginLeft * pageScale}px`;
    marginBox.style.width = `${(cfgUser.pageWidth - cfgUser.marginLeft - cfgUser.marginRight) * pageScale}px`;
    marginBox.style.height = `${(cfgUser.pageHeight - cfgUser.marginTop - cfgUser.marginBottom) * pageScale}px`;
    marginBox.style.zIndex = '5';
    previewPage.appendChild(marginBox);

    for (let r = 0; r < cfgUser.rows; r++) {
        for (let c = 0; c < cfgUser.cols; c++) {
            const box = document.createElement('div');
            box.className = 'prev-grid-item';
            box.style.width = `${cfgUser.labelWidth * pageScale}px`;
            box.style.height = `${cfgUser.labelHeight * pageScale}px`;
            box.style.top = `${(cfgUser.marginTop + r * (cfgUser.labelHeight + cfgUser.gapY)) * pageScale}px`;
            box.style.left = `${(cfgUser.marginLeft + c * (cfgUser.labelWidth + cfgUser.gapX)) * pageScale}px`;
            previewPage.appendChild(box);
        }
    }

    const lMaxW = previewLabelWrapper.clientWidth - 20;
    const lMaxH = previewLabelWrapper.clientHeight - 20; 
    let labelScale = Math.min(lMaxW / cfgUser.labelWidth, lMaxH / cfgUser.labelHeight);
    if (isNaN(labelScale) || labelScale <= 0 || !isFinite(labelScale)) labelScale = 10;

    previewLabel.style.width = `${cfgUser.labelWidth * labelScale}px`;
    previewLabel.style.height = `${cfgUser.labelHeight * labelScale}px`;
    previewLabel.innerHTML = '';

    const labelPadBox = document.createElement('div');
    labelPadBox.style.position = 'absolute';
    labelPadBox.style.border = '1px dashed rgba(239, 68, 68, 0.6)';
    labelPadBox.style.pointerEvents = 'none';
    labelPadBox.style.top = `${cfgUser.padTop * labelScale}px`;
    labelPadBox.style.left = `${cfgUser.padLeft * labelScale}px`;
    labelPadBox.style.width = `${availableLabelW * labelScale}px`;
    labelPadBox.style.height = `${availableLabelH * labelScale}px`;
    labelPadBox.style.zIndex = '5';
    previewLabel.appendChild(labelPadBox);

    let vacV = 'VACINA';
    let lotV = 'LOTE123';
    let fabV = 'FABRICANTE';
    
    if (state.vacinas && state.vacinas.length > 0) {
        vacV = state.vacinas.reduce((max, obj) => (obj.vacina || '').length > max.length ? obj.vacina : max, state.vacinas[0].vacina || '').toUpperCase() || 'VACINA';
        lotV = state.vacinas.reduce((max, obj) => (obj.lote || '').length > max.length ? obj.lote : max, state.vacinas[0].lote || '') || 'LOTE123';
        fabV = state.vacinas.reduce((max, obj) => (obj.fabricante || '').length > max.length ? obj.fabricante : max, state.vacinas[0].fabricante || '') || 'FABRICANTE';
    }

    const datV = new Date().toLocaleDateString('pt-BR');
    const usrV = localStorage.getItem('lf_nome_usuario_vacina') || 'USUÁRIO';

    for (let r = 0; r < cfgUser.doseRows; r++) {
        for (let c = 0; c < cfgUser.doseCols; c++) {
            const dBox = document.createElement('div');
            dBox.className = 'prev-dose-box';
            
            const startX = cfgUser.padLeft * labelScale;
            const startY = cfgUser.padTop * labelScale;
            
            const pxW = cfgUser.doseWidth * labelScale;
            const pxH = cfgUser.doseHeight * labelScale;
            const pxL = startX + (c * (cfgUser.doseWidth + cfgUser.doseGapX) * labelScale);
            const pxT = startY + (r * (cfgUser.doseHeight + cfgUser.doseGapY) * labelScale);

            dBox.style.width = `${pxW}px`;
            dBox.style.height = `${pxH}px`;
            dBox.style.left = `${pxL}px`;
            dBox.style.top = `${pxT}px`;

            if (r === 0 && c === 0) {
                const textPad = 0.1 * labelScale; 
                const usableH = pxH - (textPad * 2);
                const usableW = pxW - (textPad * 2);
                
                const unitH = usableH / 9.0; 
                let baseLarge = unitH * 2.0; 
                let baseSmall = unitH * 1.5; 

                // Estimativa rigorosa para a Escala Global
                const maxEstW = Math.max(
                    vacV.length * (baseLarge * 0.60),
                    datV.length * (baseLarge * 0.60),
                    lotV.length * (baseSmall * 0.50),
                    fabV.length * (baseSmall * 0.50),
                    usrV.length * (baseSmall * 0.50)
                );

                let scaleF = 1;
                if (maxEstW > usableW) {
                    scaleF = usableW / maxEstW;
                }

                const fLarge = baseLarge * scaleF;
                const fSmall = baseSmall * scaleF;

                dBox.innerHTML = `
                    <div style="position: relative; width: 100%; height: 100%;">
                        <div style="position: absolute; left: ${textPad}px; right: ${textPad}px; top: ${textPad}px; font-weight: 800; font-size: ${fLarge}px; line-height: 1; white-space: nowrap; overflow: hidden; color: #000;">${vacV}</div>
                        <div style="position: absolute; left: ${textPad}px; right: ${textPad}px; top: ${textPad + (usableH * 0.24)}px; font-weight: 800; font-size: ${fLarge}px; line-height: 1; white-space: nowrap; overflow: hidden; color: #000;">${datV}</div>
                        <div style="position: absolute; left: ${textPad}px; right: ${textPad}px; top: ${textPad + (usableH * 0.52)}px; font-weight: 600; font-size: ${fSmall}px; line-height: 1; white-space: nowrap; overflow: hidden; color: #505050;">${lotV}</div>
                        <div style="position: absolute; left: ${textPad}px; right: ${textPad}px; top: ${textPad + (usableH * 0.70)}px; font-weight: 600; font-size: ${fSmall}px; line-height: 1; white-space: nowrap; overflow: hidden; color: #505050;">${fabV}</div>
                        <div style="position: absolute; left: ${textPad}px; right: ${textPad}px; top: ${textPad + (usableH * 0.88)}px; font-weight: 600; font-size: ${fSmall}px; line-height: 1; white-space: nowrap; overflow: hidden; color: #505050;">${usrV.toUpperCase()}</div>
                    </div>
                `;
            }
            previewLabel.appendChild(dBox);
        }
    }
}

document.querySelectorAll('.num-btn').forEach(btn => {
    let interval, timeout;

    const startChange = (dir) => {
        const input = btn.parentElement.querySelector('input');
        const step = parseFloat(input.getAttribute('step')) || 1;
        
        const change = () => {
            let val = parseFloat(input.value) || 0;
            val += (step * dir);
            if (val < 0) val = 0;
            input.value = (Math.round(val * 100) / 100).toString();
            input.dispatchEvent(new Event('input'));
        };
        
        change(); 
        timeout = setTimeout(() => {
            interval = setInterval(change, 80);
        }, 400); 
    };

    const stopChange = () => {
        clearTimeout(timeout);
        clearInterval(interval);
    };

    btn.addEventListener('mousedown', () => startChange(btn.classList.contains('plus') ? 1 : -1));
    btn.addEventListener('mouseup', stopChange);
    btn.addEventListener('mouseleave', stopChange);
    
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startChange(btn.classList.contains('plus') ? 1 : -1);
    }, { passive: false });
    btn.addEventListener('touchend', stopChange);
    btn.addEventListener('touchcancel', stopChange);
});

for (let key in inputsCfg) {
    if (inputsCfg[key]) {
        inputsCfg[key].addEventListener('input', (e) => {
            if (parseFloat(e.target.value) < 0) e.target.value = 0;
            atualizarPreview();
        });
    }
}

if (btnConfigPrint) {
    btnConfigPrint.addEventListener('click', () => {
        carregarConfiguracoes(); 
        configPrintOverlay.classList.remove('app-hidden');
        setTimeout(() => {
            atualizarPreview();
            moveTabBg(document.querySelector('.tab-btn.active'));
        }, 100); 
    });
}

function fecharModalConfig() {
    configPrintOverlay.classList.add('hiding');
    setTimeout(() => {
        configPrintOverlay.classList.add('app-hidden');
        configPrintOverlay.classList.remove('hiding');
    }, 600);
}

document.getElementById('btnFecharConfig').addEventListener('click', fecharModalConfig);

btnSalvarConfig.addEventListener('click', () => {
    if(btnSalvarConfig.disabled) return;

    for (let key in inputsCfg) {
        configImpresso[key] = parseFloat(inputsCfg[key].value) || 0;
    }
    localStorage.setItem('vacina_config_impressao', JSON.stringify(configImpresso));
    
    btnSalvarConfig.innerText = "Salvo! ✔";
    btnSalvarConfig.style.backgroundColor = "#10B981";
    
    setTimeout(() => {
        btnSalvarConfig.innerText = "Salvar";
        btnSalvarConfig.style.backgroundColor = "var(--primary-color)";
        fecharModalConfig();
    }, 1000);
});

window.addEventListener('resize', () => {
    if (!configPrintOverlay.classList.contains('app-hidden')) {
        atualizarPreview();
        moveTabBg(document.querySelector('.tab-btn.active'));
    }
});

carregarConfiguracoes();