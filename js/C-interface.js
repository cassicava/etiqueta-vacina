function carregarDados() {
    const savedV = localStorage.getItem('vacinas_salvas');
    if (savedV) {
        try { state.vacinas = JSON.parse(savedV); } catch(e) { state.vacinas = []; }
    }
    const savedR = localStorage.getItem('rotinas_salvas');
    if (savedR) {
        try { state.rotinas = JSON.parse(savedR); } catch(e) { state.rotinas = []; }
    }
}

function salvarDados() {
    localStorage.setItem('vacinas_salvas', JSON.stringify(state.vacinas));
    localStorage.setItem('rotinas_salvas', JSON.stringify(state.rotinas));
}

function classificarValidade(validadeStr) {
    if (!validadeStr || validadeStr.trim() === '') return '';
    let parts = validadeStr.split('/');
    let mes, ano;
    if (parts.length === 2) { mes = parseInt(parts[0], 10); ano = parseInt(parts[1], 10); }
    else if (parts.length === 3) { mes = parseInt(parts[1], 10); ano = parseInt(parts[2], 10); }
    else return 'validade-ok';

    if (isNaN(mes) || isNaN(ano)) return '';

    const hoje = new Date();
    const dataVencimento = new Date(ano, mes, 0); 
    const diffDias = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24));

    if (diffDias < 0) return 'validade-vencida';
    if (diffDias <= 60) return 'validade-aviso';
    return 'validade-ok';
}

function renderizarLista() {
    carregarDados();
    contentArea.innerHTML = `
        <div class="cards-header">
            <span>Vacina</span>
            <span>Lote</span>
            <span>Fabricante</span>
            <span class="text-center">Validade</span>
            <span class="header-empty"></span>
            <span class="header-empty"></span>
        </div>
    `;
    state.vacinas.sort((a, b) => (a.vacina || '').toLowerCase().localeCompare((b.vacina || '').toLowerCase()));

    if (state.vacinas.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'empty-state';
        emptyCard.innerHTML = `<div class="empty-state-icon">💉</div><div class="empty-state-text">Você ainda não possui vacinas cadastradas.<br>Clique em "+ Adicionar Vacina" ou carregue o calendário!</div><button id="btnCarregarPNI" class="btn-salvar-cfg" style="margin-top: 20px; padding: 12px 25px; width: auto; border-radius: 12px; border:none; color:white; background-color: var(--primary-color); cursor: pointer; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);">📚 Carregar Catálogo PNI</button>`;
        contentArea.appendChild(emptyCard);
        
        document.getElementById('btnCarregarPNI').addEventListener('click', window.carregarCatalogoPNI);
    } else {
        state.vacinas.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.id = `vacina-${item.id}`;
            card.innerHTML = gerarHTMLCardVacina(item, 'view');
            contentArea.appendChild(card);
        });
    }

    const cardAdd = document.createElement('div');
    cardAdd.className = 'card card-add';
    cardAdd.innerHTML = `<span>+ Adicionar Vacina</span>`;
    cardAdd.onclick = window.adicionarVacina;
    contentArea.appendChild(cardAdd);

    if (state.vacinas.length > 0) {
        const cardPrintList = document.createElement('div');
        cardPrintList.className = 'card card-add';
        cardPrintList.style.backgroundColor = 'var(--primary-color)';
        cardPrintList.style.color = '#fff';
        cardPrintList.style.border = 'none';
        cardPrintList.style.marginTop = '5px';
        cardPrintList.innerHTML = `<span>🖨️ Imprimir Lista de Vacinas</span>`;
        cardPrintList.onclick = window.imprimirListaVacinas;
        contentArea.appendChild(cardPrintList);
    }
}

function renderizarRotinas() {
    carregarDados();
    rotinasArea.innerHTML = `<div class="rotinas-grid" id="rotinasGrid"></div>`;
    const grid = document.getElementById('rotinasGrid');

    if (state.rotinas.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-text">Você não possui rotinas criadas.<br>Clique abaixo para agrupar suas vacinas!</div></div>`;
    } else {
        state.rotinas.forEach(item => {
            const card = document.createElement('div');
            card.className = 'rotina-card';
            card.id = `rotina-${item.id}`;
            card.innerHTML = gerarHTMLCardRotina(item, 'view');
            grid.appendChild(card);
        });
    }

    const cardAdd = document.createElement('div');
    cardAdd.className = 'card card-add';
    cardAdd.style.gridColumn = '1 / -1';
    cardAdd.innerHTML = `<span>+ Nova Rotina</span>`;
    cardAdd.onclick = window.adicionarRotina;
    grid.appendChild(cardAdd);
}

window.adicionarVacina = function() {
    const novaId = Date.now();
    const novaVacina = { id: novaId, vacina: '', lote: '', fabricante: '', validade: '', isNew: true };
    state.vacinas.push(novaVacina);
    const card = document.createElement('div');
    card.className = 'card editing';
    card.id = `vacina-${novaId}`;
    card.innerHTML = gerarHTMLCardVacina(novaVacina, 'edit');
    const emptyState = contentArea.querySelector('.empty-state');
    if (emptyState) emptyState.style.display = 'none';
    const cardAdd = contentArea.querySelector('.card-add');
    contentArea.insertBefore(card, cardAdd);
    if (cardAdd) cardAdd.style.display = 'none';
    contentArea.scrollTop = contentArea.scrollHeight;
}

window.adicionarRotina = function() {
    if (state.vacinas.length === 0) {
        alert("Cadastre pelo menos uma vacina antes de criar uma rotina!");
        return;
    }
    const novaId = Date.now();
    const novaRotina = { id: novaId, nome: '', vacinasIds: [], isNew: true };
    state.rotinas.push(novaRotina);
    const card = document.createElement('div');
    card.className = 'rotina-card editing';
    card.id = `rotina-${novaId}`;
    card.innerHTML = gerarHTMLCardRotina(novaRotina, 'edit');
    const grid = document.getElementById('rotinasGrid');
    const emptyState = grid.querySelector('.empty-state');
    if (emptyState) emptyState.style.display = 'none';
    const cardAdd = grid.querySelector('.card-add');
    grid.insertBefore(card, cardAdd);
    if (cardAdd) cardAdd.style.display = 'none';
    rotinasArea.scrollTop = rotinasArea.scrollHeight;
}

window.carregarCatalogoPNI = function() {
    const nomesVacinas = [
        "BCG", "Hep. B", "Penta", "VIP",
        "Pneumo 10", "Rota", "Men. C", "VOP",
        "FA", "SCR", "Tetra", "DTP",
        "Hep. A", "HPV", "Men. ACWY", "Varicela", 
        "Influenza", "dT", "dTpa"
    ];

    const novasVacinas = [];
    const mapIds = {};
    let baseId = Date.now();

    nomesVacinas.forEach((nome, idx) => {
        const vId = baseId + idx;
        mapIds[nome] = vId;
        novasVacinas.push({ id: vId, vacina: nome, lote: '', fabricante: '', validade: '' });
    });

    const novasRotinas = [
        { id: baseId + 100, nome: "Ao Nascer", vacinasIds: [mapIds["BCG"], mapIds["Hep. B"]] },
        { id: baseId + 101, nome: "2 Meses", vacinasIds: [mapIds["Penta"], mapIds["VIP"], mapIds["Pneumo 10"], mapIds["Rota"]] },
        { id: baseId + 102, nome: "3 Meses", vacinasIds: [mapIds["Men. C"]] },
        { id: baseId + 103, nome: "4 Meses", vacinasIds: [mapIds["Penta"], mapIds["VIP"], mapIds["Pneumo 10"], mapIds["Rota"]] },
        { id: baseId + 104, nome: "5 Meses", vacinasIds: [mapIds["Men. C"]] },
        { id: baseId + 105, nome: "6 Meses", vacinasIds: [mapIds["Penta"], mapIds["VIP"]] },
        { id: baseId + 106, nome: "9 Meses", vacinasIds: [mapIds["FA"]] },
        { id: baseId + 107, nome: "12 Meses", vacinasIds: [mapIds["SCR"], mapIds["Pneumo 10"], mapIds["Men. C"]] },
        { id: baseId + 108, nome: "15 Meses", vacinasIds: [mapIds["DTP"], mapIds["VOP"], mapIds["Tetra"], mapIds["Hep. A"]] },
        { id: baseId + 109, nome: "4 Anos", vacinasIds: [mapIds["DTP"], mapIds["VOP"], mapIds["SCR"], mapIds["Varicela"], mapIds["Influenza"]] }
    ];

    state.vacinas = novasVacinas;
    state.rotinas = novasRotinas;
    salvarDados();
    renderizarLista();
};

window.formatarData = function(input) {
    let v = input.value.replace(/\D/g, ''); 
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 4 && v.length <= 6) input.value = v.replace(/^(\d{2})(\d+)/, '$1/$2');
    else if (v.length > 6) input.value = v.replace(/^(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
    else if (v.length > 2) input.value = v.replace(/^(\d{2})(\d+)/, '$1/$2');
    else input.value = v;
}

window.atualizarContador = function(input) {
    const max = parseInt(input.getAttribute('maxlength'), 10);
    const counter = input.nextElementSibling;
    if (counter && counter.classList.contains('char-counter')) {
        counter.innerText = `${input.value.length}/${max}`;
        if (input.value.length >= max) counter.classList.add('limit-reached');
        else counter.classList.remove('limit-reached');
    }
    input.classList.remove('error');
}

function gerarHTMLCardVacina(item, estado) {
    const classeValidade = classificarValidade(item.validade);
    let tooltipAttr = "";
    if (classeValidade === 'validade-vencida') tooltipAttr = `data-tooltip="🔴 Cuidado: Vacina Vencida!"`;
    else if (classeValidade === 'validade-aviso') tooltipAttr = `data-tooltip="🟠 Atenção: Vence em < 60 dias"`;
    else if (classeValidade === 'validade-ok') tooltipAttr = `data-tooltip="🟢 Validade OK"`;

    if (estado === 'edit') {
        return `
            <div class="card-grid">
                <div class="card-col"><div class="input-wrapper"><input type="text" id="edit-vacina-${item.id}" class="card-input" placeholder="Vacina" value="${item.vacina}" maxlength="15" oninput="atualizarContador(this)"><span class="char-counter ${item.vacina.length >= 15 ? 'limit-reached' : ''}">${item.vacina.length}/15</span></div></div>
                <div class="card-col"><div class="input-wrapper"><input type="text" id="edit-lote-${item.id}" class="card-input" placeholder="Lote" value="${item.lote}" maxlength="15" oninput="atualizarContador(this)"><span class="char-counter ${item.lote.length >= 15 ? 'limit-reached' : ''}">${item.lote.length}/15</span></div></div>
                <div class="card-col"><div class="input-wrapper"><input type="text" id="edit-fabricante-${item.id}" class="card-input" placeholder="Fabricante" value="${item.fabricante}" maxlength="15" oninput="atualizarContador(this)"><span class="char-counter ${item.fabricante.length >= 15 ? 'limit-reached' : ''}">${item.fabricante.length}/15</span></div></div>
                <div class="card-col text-center"><div class="input-wrapper"><input type="text" id="edit-validade-${item.id}" class="card-input input-center" placeholder="Validade" value="${item.validade}" oninput="formatarData(this); atualizarContador(this)" maxlength="10"><span class="char-counter ${item.validade.length >= 10 ? 'limit-reached' : ''}">${item.validade.length}/10</span></div></div>
                <div class="card-separator">|</div>
                <div class="card-actions">
                    <button class="btn-action btn-save" onclick="salvarEdicaoVacina(${item.id})" title="Salvar">✔</button>
                    <button class="btn-action btn-cancel" onclick="cancelarEdicaoVacina(${item.id})" title="Cancelar">✖</button>
                </div>
            </div>`;
    } else if (estado === 'delete') {
        return `
            <div class="card-grid">
                <div class="card-col"><span class="card-value">${item.vacina}</span></div>
                <div class="card-col"><span class="card-value">${item.lote}</span></div>
                <div class="card-col"><span class="card-value">${item.fabricante}</span></div>
                <div class="card-col text-center"><span class="card-value ${classeValidade}" ${tooltipAttr}>${item.validade}</span></div>
                <div class="card-separator">|</div>
                <div class="card-actions">
                    <span class="confirm-msg">Excluir?</span>
                    <button class="btn-action btn-confirm" onclick="confirmarExclusaoVacina(${item.id})" title="Confirmar">✔</button>
                    <button class="btn-action btn-cancel" onclick="mudarEstadoCardVacina(${item.id}, 'view')" title="Cancelar">✖</button>
                </div>
            </div>`;
    } else {
        return `
            <div class="card-grid">
                <div class="card-col"><span class="card-value" data-label="Vacina">${item.vacina}</span></div>
                <div class="card-col"><span class="card-value" data-label="Lote">${item.lote}</span></div>
                <div class="card-col"><span class="card-value" data-label="Fabricante">${item.fabricante}</span></div>
                <div class="card-col text-center"><span class="card-value ${classeValidade}" data-label="Validade" ${tooltipAttr}>${item.validade}</span></div>
                <div class="card-separator">|</div>
                <div class="card-actions">
                    <button class="btn-action btn-print" onclick="imprimirVacina(${item.id})" title="Imprimir Etiquetas">🖨️</button>
                    <button class="btn-action btn-edit" onclick="mudarEstadoCardVacina(${item.id}, 'edit')" title="Editar Vacina">✎</button>
                    <button class="btn-action btn-delete" onclick="mudarEstadoCardVacina(${item.id}, 'delete')" title="Excluir Vacina">🗑️</button>
                </div>
            </div>`;
    }
}

function gerarHTMLCardRotina(item, estado) {
    if (estado === 'edit') {
        let checkboxesHTML = state.vacinas.map(v => {
            const isChecked = item.vacinasIds && item.vacinasIds.includes(v.id) ? 'checked' : '';
            return `<input type="checkbox" id="cb-vac-${item.id}-${v.id}" value="${v.id}" class="vaccine-chip-input cb-rotina-${item.id}" ${isChecked}>
                    <label for="cb-vac-${item.id}-${v.id}" class="vaccine-chip-label">${v.vacina || 'Sem Nome'}</label>`;
        }).join('');

        return `
            <input type="text" id="edit-rotina-nome-${item.id}" class="card-input rotina-edit-title-input input-center" placeholder="Nome da Rotina (ex: 2 Meses)" value="${item.nome}" maxlength="20">
            <div class="vaccine-checkbox-list">${checkboxesHTML}</div>
            <div class="rotina-acoes">
                <button class="btn-action btn-save" onclick="salvarEdicaoRotina(${item.id})" title="Salvar">✔</button>
                <button class="btn-action btn-cancel" onclick="cancelarEdicaoRotina(${item.id})" title="Cancelar">✖</button>
            </div>`;
    } else if (estado === 'delete') {
        return `
            <h3 class="rotina-titulo" style="color: var(--btn-excluir-color);">Atenção!</h3>
            <div class="rotina-chips"><span class="card-value" style="white-space: normal; text-align: center;">Tem a certeza que deseja excluir a rotina <b>${item.nome}</b>?</span></div>
            <div class="rotina-acoes">
                <button class="btn-action btn-confirm" onclick="confirmarExclusaoRotina(${item.id})" title="Confirmar">✔</button>
                <button class="btn-action btn-cancel" onclick="mudarEstadoCardRotina(${item.id}, 'view')" title="Cancelar">✖</button>
            </div>`;
    } else {
        const chipsHTML = item.vacinasIds.map(vid => {
            const v = state.vacinas.find(vac => vac.id === vid);
            return v ? `<span class="rotina-chip">${v.vacina || 'Sem Nome'}</span>` : '';
        }).join('');
        
        return `
            <h3 class="rotina-titulo">${item.nome}</h3>
            <div class="rotina-chips">${chipsHTML || '<span class="text-muted">Nenhuma vacina válida</span>'}</div>
            <div class="rotina-acoes">
                <button class="btn-action btn-print" onclick="imprimirRotina(${item.id})" title="Imprimir Rotina">🖨️</button>
                <button class="btn-action btn-edit" onclick="mudarEstadoCardRotina(${item.id}, 'edit')" title="Editar Rotina">✎</button>
                <button class="btn-action btn-delete" onclick="mudarEstadoCardRotina(${item.id}, 'delete')" title="Excluir Rotina">🗑️</button>
            </div>`;
    }
}

window.mudarEstadoCardVacina = function(id, estado) {
    const v = state.vacinas.find(x => x.id === id);
    if (!v) return;
    const card = document.getElementById(`vacina-${id}`);
    if (card) {
        if (estado === 'edit') card.classList.add('editing'); else card.classList.remove('editing');
        card.innerHTML = gerarHTMLCardVacina(v, estado);
    }
}

window.mudarEstadoCardRotina = function(id, estado) {
    const r = state.rotinas.find(x => x.id === id);
    if (!r) return;
    const card = document.getElementById(`rotina-${id}`);
    if (card) {
        if (estado === 'edit') card.classList.add('editing'); else card.classList.remove('editing');
        card.innerHTML = gerarHTMLCardRotina(r, estado);
    }
}

window.salvarEdicaoVacina = function(id) {
    const v = state.vacinas.find(x => x.id === id);
    if (!v) return;
    const inputVacina = document.getElementById(`edit-vacina-${id}`);
    const nomeValor = inputVacina.value.trim();
    if (nomeValor === "") {
        inputVacina.classList.remove('error');
        void inputVacina.offsetWidth; 
        inputVacina.classList.add('error');
        inputVacina.focus();
        return; 
    }
    v.vacina = nomeValor;
    v.lote = document.getElementById(`edit-lote-${id}`).value.trim();
    v.fabricante = document.getElementById(`edit-fabricante-${id}`).value.trim();
    v.validade = document.getElementById(`edit-validade-${id}`).value.trim();
    delete v.isNew;
    salvarDados();
    renderizarLista(); 
}

window.salvarEdicaoRotina = function(id) {
    const r = state.rotinas.find(x => x.id === id);
    if (!r) return;
    const inputNome = document.getElementById(`edit-rotina-nome-${id}`);
    const nomeValor = inputNome.value.trim();
    if (nomeValor === "") {
        inputNome.classList.remove('error');
        void inputNome.offsetWidth; 
        inputNome.classList.add('error');
        inputNome.focus();
        return; 
    }
    const checkboxes = document.querySelectorAll(`.cb-rotina-${id}:checked`);
    const selecionadas = Array.from(checkboxes).map(cb => parseInt(cb.value));
    if (selecionadas.length === 0) {
        alert("Selecione pelo menos uma vacina para compor esta rotina!");
        return;
    }
    r.nome = nomeValor;
    r.vacinasIds = selecionadas;
    delete r.isNew;
    salvarDados();
    renderizarRotinas();
}

window.cancelarEdicaoVacina = function(id) {
    const idx = state.vacinas.findIndex(x => x.id === id);
    if (idx > -1) {
        if (state.vacinas[idx].isNew) { state.vacinas.splice(idx, 1); renderizarLista(); }
        else mudarEstadoCardVacina(id, 'view');
    }
}

window.cancelarEdicaoRotina = function(id) {
    const idx = state.rotinas.findIndex(x => x.id === id);
    if (idx > -1) {
        if (state.rotinas[idx].isNew) { state.rotinas.splice(idx, 1); renderizarRotinas(); }
        else mudarEstadoCardRotina(id, 'view');
    }
}

window.confirmarExclusaoVacina = function(id) {
    const card = document.getElementById(`vacina-${id}`);
    if (card) {
        card.style.transform = 'translateX(-50px)';
        card.style.opacity = '0';
        setTimeout(() => {
            state.vacinas = state.vacinas.filter(x => x.id !== id);
            state.rotinas.forEach(r => r.vacinasIds = r.vacinasIds.filter(vid => vid !== id));
            state.rotinas = state.rotinas.filter(r => r.vacinasIds.length > 0);
            salvarDados();
            renderizarLista(); 
        }, 400);
    }
}

window.confirmarExclusaoRotina = function(id) {
    const card = document.getElementById(`rotina-${id}`);
    if (card) {
        card.style.transform = 'scale(0.8)';
        card.style.opacity = '0';
        setTimeout(() => {
            state.rotinas = state.rotinas.filter(x => x.id !== id);
            salvarDados();
            renderizarRotinas(); 
        }, 400);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnViewVacinas = document.getElementById('btnViewVacinas');
    const btnViewRotinas = document.getElementById('btnViewRotinas');
    const viewToggleBg = document.getElementById('viewToggleBg');

    function moveToggleBg(btn) {
        if(!btn || !viewToggleBg) return;
        viewToggleBg.style.width = btn.offsetWidth + 'px';
        viewToggleBg.style.left = btn.offsetLeft + 'px';
    }

    if (btnViewVacinas && btnViewRotinas) {
        btnViewVacinas.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btnViewVacinas.classList.add('active');
            moveToggleBg(btnViewVacinas);
            contentArea.classList.remove('app-hidden');
            rotinasArea.classList.add('app-hidden');
            renderizarLista();
        });
        
        btnViewRotinas.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btnViewRotinas.classList.add('active');
            moveToggleBg(btnViewRotinas);
            rotinasArea.classList.remove('app-hidden');
            contentArea.classList.add('app-hidden');
            renderizarRotinas();
        });

        window.addEventListener('resize', () => {
            const activeBtn = document.querySelector('.toggle-btn.active');
            if(activeBtn) moveToggleBg(activeBtn);
        });
    }

    const btnBackup = document.getElementById('btnBackup');
    const backupOverlay = document.getElementById('backupOverlay');
    const btnFecharBackup = document.getElementById('btnFecharBackup');
    const btnExportarBackup = document.getElementById('btnExportarBackup');
    const btnImportarBackup = document.getElementById('btnImportarBackup');
    const inputImportarBackup = document.getElementById('inputImportarBackup');
    const btnDicas = document.getElementById('btnDicas');
    const dicasOverlay = document.getElementById('dicasOverlay');
    const btnFecharDicas = document.getElementById('btnFecharDicas');

    if (btnDicas) btnDicas.addEventListener('click', () => dicasOverlay.classList.add('open'));
    if (btnFecharDicas) btnFecharDicas.addEventListener('click', () => dicasOverlay.classList.remove('open'));
    if (dicasOverlay) dicasOverlay.addEventListener('click', (e) => { if (e.target === dicasOverlay) dicasOverlay.classList.remove('open'); });

    if (btnBackup) btnBackup.addEventListener('click', () => backupOverlay.classList.add('open'));
    if (btnFecharBackup) btnFecharBackup.addEventListener('click', () => backupOverlay.classList.remove('open'));
    if (backupOverlay) backupOverlay.addEventListener('click', (e) => { if (e.target === backupOverlay) backupOverlay.classList.remove('open'); });

    if (btnExportarBackup) {
        btnExportarBackup.addEventListener('click', () => {
            if (state.vacinas.length === 0 && state.rotinas.length === 0) {
                alert("Você não possui dados para exportar!");
                return;
            }
            const dataToExport = { vacinas: state.vacinas, rotinas: state.rotinas };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
            const dlNode = document.createElement('a');
            dlNode.setAttribute("href", dataStr);
            dlNode.setAttribute("download", "backup_vacinas_rotinas.json");
            document.body.appendChild(dlNode);
            dlNode.click();
            dlNode.remove();
            backupOverlay.classList.remove('open');
        });
    }

    if (btnImportarBackup && inputImportarBackup) {
        btnImportarBackup.addEventListener('click', () => inputImportarBackup.click());
        inputImportarBackup.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (Array.isArray(imported)) {
                        state.vacinas = imported;
                        state.rotinas = [];
                    } else if (imported.vacinas && Array.isArray(imported.vacinas)) {
                        state.vacinas = imported.vacinas;
                        state.rotinas = imported.rotinas || [];
                    } else {
                        throw new Error();
                    }
                    salvarDados();
                    btnViewVacinas.click();
                    backupOverlay.classList.remove('open');
                    alert("🎉 Backup importado com sucesso!");
                } catch(err) {
                    alert("Arquivo inválido! Certifique-se que é o backup correto.");
                }
            };
            reader.readAsText(file);
            e.target.value = ''; 
        });
    }
});