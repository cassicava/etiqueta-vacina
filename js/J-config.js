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
            if (!configImpresso.fields) {
                configImpresso.fields = { vacina: true, data: true, lote: true, fabricante: true, vacinador: true };
            }
        } catch(e) {}
    } else {
        if (!configImpresso.fields) {
            configImpresso.fields = { vacina: true, data: true, lote: true, fabricante: true, vacinador: true };
        }
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

    document.querySelectorAll('.chip-btn[data-field]').forEach(btn => {
        const field = btn.getAttribute('data-field');
        if (configImpresso.fields[field]) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const cfgNomeVacinador = document.getElementById('cfgNomeVacinador');
    if (cfgNomeVacinador) {
        cfgNomeVacinador.value = configImpresso.nomeVacinador || localStorage.getItem('lf_nome_usuario_vacina') || '';
    }

    const cfgTextoData = document.getElementById('cfgTextoData');
    if (cfgTextoData) {
        cfgTextoData.value = configImpresso.textoData || new Date().toLocaleDateString('pt-BR');
    }

    const wrapperVacinador = document.getElementById('vacinadorInputWrapper');
    if (wrapperVacinador) wrapperVacinador.style.display = configImpresso.fields.vacinador ? 'flex' : 'none';

    const wrapperData = document.getElementById('dataInputWrapper');
    if (wrapperData) wrapperData.style.display = configImpresso.fields.data ? 'flex' : 'none';

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
    
    cfgUser.fields = {};
    document.querySelectorAll('.chip-btn[data-field]').forEach(b => {
        cfgUser.fields[b.dataset.field] = b.classList.contains('active');
    });

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

    const grupoMargens = document.getElementById('ctrlMarginTop')?.closest('.config-grupo');
    if (grupoMargens) {
        let aviso = document.getElementById('aviso-margem-impressora');
        if (cfgUser.marginLeft < 0.4 || cfgUser.marginTop < 0.4 || cfgUser.marginRight < 0.4 || cfgUser.marginBottom < 0.4) {
            if (!aviso) {
                aviso = document.createElement('div');
                aviso.id = 'aviso-margem-impressora';
                aviso.style.color = '#d97706';
                aviso.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                aviso.style.padding = '8px';
                aviso.style.borderRadius = '8px';
                aviso.style.marginTop = '15px';
                aviso.style.fontSize = '0.85rem';
                aviso.style.textAlign = 'center';
                aviso.style.fontWeight = 'bold';
                aviso.style.width = '100%';
                aviso.innerText = '⚠️ Atenção: Impressoras comuns cortam margens menores que 0.4cm.';
                grupoMargens.appendChild(aviso);
            }
        } else {
            if (aviso) aviso.remove();
        }
    }

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

    let vacV = 'Vacina';
    let lotV = 'LOTE123';
    let fabV = 'FABRICANTE';
    
    if (state.vacinas && state.vacinas.length > 0) {
        vacV = state.vacinas.reduce((max, obj) => (obj.vacina || '').length > max.length ? obj.vacina : max, state.vacinas[0].vacina || '') || 'Vacina';
        lotV = state.vacinas.reduce((max, obj) => (obj.lote || '').length > max.length ? obj.lote : max, state.vacinas[0].lote || '') || 'LOTE123';
        fabV = state.vacinas.reduce((max, obj) => (obj.fabricante || '').length > max.length ? obj.fabricante : max, state.vacinas[0].fabricante || '') || 'FABRICANTE';
    }

    const inputDataStr = document.getElementById('cfgTextoData').value.trim();
    const datV = inputDataStr || new Date().toLocaleDateString('pt-BR');
    
    const nomeInputVacinador = document.getElementById('cfgNomeVacinador').value.trim();
    const usrV = nomeInputVacinador || localStorage.getItem('lf_nome_usuario_vacina') || 'Usuário';

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const getScaledSizeDOM = (text, baseSize, weight, usableW) => {
        if (!text) return baseSize;
        ctx.font = `${weight} ${baseSize}px helvetica, sans-serif`;
        const w = ctx.measureText(text).width;
        if (w > usableW) {
            return baseSize * (usableW / w);
        }
        return baseSize;
    };

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
                
                const largeCount = (cfgUser.fields.vacina ? 1 : 0) + (cfgUser.fields.data ? 1 : 0);
                const smallCount = (cfgUser.fields.lote ? 1 : 0) + (cfgUser.fields.fabricante ? 1 : 0) + (cfgUser.fields.vacinador ? 1 : 0);
                const totalUnits = (largeCount * 2.0) + (smallCount * 1.5);
                
                const unitH = totalUnits > 0 ? (usableH / totalUnits) : 0;
                let baseLarge = unitH * 2.0; 
                let baseSmall = unitH * 1.5; 

                const sizeVacina = cfgUser.fields.vacina ? getScaledSizeDOM(vacV, baseLarge, 800, usableW) : baseLarge;
                const sizeData = cfgUser.fields.data ? getScaledSizeDOM(datV, baseLarge, 800, usableW) : baseLarge;

                const activeLargeSizes = [];
                if (cfgUser.fields.vacina) activeLargeSizes.push(sizeVacina);
                if (cfgUser.fields.data) activeLargeSizes.push(sizeData);
                const capLarge = activeLargeSizes.length > 0 ? Math.min(...activeLargeSizes) : baseLarge;

                const maxSmallAllowed = Math.min(baseSmall, capLarge);

                const sizeLote = cfgUser.fields.lote ? getScaledSizeDOM(lotV, maxSmallAllowed, 600, usableW) : maxSmallAllowed;
                const sizeFabricante = cfgUser.fields.fabricante ? getScaledSizeDOM(fabV, maxSmallAllowed, 600, usableW) : maxSmallAllowed;
                const sizeVacinador = cfgUser.fields.vacinador ? getScaledSizeDOM(usrV, maxSmallAllowed, 600, usableW) : maxSmallAllowed;

                const activeItems = [];
                if (cfgUser.fields.vacina) activeItems.push({ text: vacV, weight: 800, size: sizeVacina, color: '#000' });
                if (cfgUser.fields.data) activeItems.push({ text: datV, weight: 800, size: sizeData, color: '#000' });
                if (cfgUser.fields.lote) activeItems.push({ text: lotV, weight: 600, size: sizeLote, color: '#505050' });
                if (cfgUser.fields.fabricante) activeItems.push({ text: fabV, weight: 600, size: sizeFabricante, color: '#505050' });
                if (cfgUser.fields.vacinador) activeItems.push({ text: usrV, weight: 600, size: sizeVacinador, color: '#505050' });

                let innerHTML = `<div style="position: relative; width: 100%; height: 100%;">`;
                const count = activeItems.length;
                
                if (count > 0) {
                    const segmentH = usableH / count;
                    activeItems.forEach((item, idx) => {
                        const topPos = textPad + (idx * segmentH) + (segmentH / 2);
                        innerHTML += `<div style="position: absolute; left: ${textPad}px; right: ${textPad}px; top: ${topPos}px; transform: translateY(-50%); font-weight: ${item.weight}; font-size: ${item.size}px; line-height: 1; white-space: nowrap; overflow: hidden; color: ${item.color};">${item.text}</div>`;
                    });
                }

                innerHTML += `</div>`;
                dBox.innerHTML = innerHTML;
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

document.querySelectorAll('.chip-btn[data-field]').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        
        if (btn.getAttribute('data-field') === 'vacinador') {
            const wrapper = document.getElementById('vacinadorInputWrapper');
            if (wrapper) wrapper.style.display = btn.classList.contains('active') ? 'flex' : 'none';
        }
        if (btn.getAttribute('data-field') === 'data') {
            const wrapper = document.getElementById('dataInputWrapper');
            if (wrapper) wrapper.style.display = btn.classList.contains('active') ? 'flex' : 'none';
        }

        atualizarPreview();
    });
});

const inputNomeVacinador = document.getElementById('cfgNomeVacinador');
if (inputNomeVacinador) inputNomeVacinador.addEventListener('input', atualizarPreview);

const inputTextoData = document.getElementById('cfgTextoData');
if (inputTextoData) inputTextoData.addEventListener('input', atualizarPreview);

const btnDataHoje = document.getElementById('btnDataHoje');
if (btnDataHoje) {
    btnDataHoje.addEventListener('click', () => {
        document.getElementById('cfgTextoData').value = new Date().toLocaleDateString('pt-BR');
        atualizarPreview();
    });
}

const btnDataBranco = document.getElementById('btnDataBranco');
if (btnDataBranco) {
    btnDataBranco.addEventListener('click', () => {
        const ano = new Date().getFullYear();
        document.getElementById('cfgTextoData').value = `___/___/${ano}`;
        atualizarPreview();
    });
}

const btnVacinadorLogado = document.getElementById('btnVacinadorLogado');
if (btnVacinadorLogado) {
    btnVacinadorLogado.addEventListener('click', () => {
        document.getElementById('cfgNomeVacinador').value = localStorage.getItem('lf_nome_usuario_vacina') || 'Usuário';
        atualizarPreview();
    });
}

const btnVacinadorBranco = document.getElementById('btnVacinadorBranco');
if (btnVacinadorBranco) {
    btnVacinadorBranco.addEventListener('click', () => {
        document.getElementById('cfgNomeVacinador').value = '_______________';
        atualizarPreview();
    });
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

    configImpresso.fields = {};
    document.querySelectorAll('.chip-btn[data-field]').forEach(btn => {
        configImpresso.fields[btn.getAttribute('data-field')] = btn.classList.contains('active');
    });

    const cfgNomeVacinador = document.getElementById('cfgNomeVacinador');
    if (cfgNomeVacinador) configImpresso.nomeVacinador = cfgNomeVacinador.value.trim();

    const cfgTextoData = document.getElementById('cfgTextoData');
    if (cfgTextoData) configImpresso.textoData = cfgTextoData.value.trim();

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