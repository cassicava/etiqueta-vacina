function carregarVacinas() {
    const saved = localStorage.getItem('vacinas_salvas');
    if (saved) {
        try { 
            state.vacinas = JSON.parse(saved); 
        } catch(e) { 
            state.vacinas = []; 
        }
    }
}

function salvarVacinas() {
    localStorage.setItem('vacinas_salvas', JSON.stringify(state.vacinas));
}

function classificarValidade(validadeStr) {
    if (!validadeStr || validadeStr.trim() === '') return '';
    
    let parts = validadeStr.split('/');
    let mes, ano;
    
    if (parts.length === 2) {
        mes = parseInt(parts[0], 10);
        ano = parseInt(parts[1], 10);
    } else if (parts.length === 3) {
        mes = parseInt(parts[1], 10);
        ano = parseInt(parts[2], 10);
    } else {
        return 'validade-ok';
    }

    if (isNaN(mes) || isNaN(ano)) return '';

    const hoje = new Date();
    const dataVencimento = new Date(ano, mes, 0); 

    const diffTempo = dataVencimento.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTempo / (1000 * 3600 * 24));

    if (diffDias < 0) {
        return 'validade-vencida';
    } else if (diffDias <= 60) {
        return 'validade-aviso';
    } else {
        return 'validade-ok';
    }
}

function renderizarLista() {
    carregarVacinas();
    
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
    
    state.vacinas.sort((a, b) => {
        const nomeA = a.vacina ? a.vacina.toLowerCase() : '';
        const nomeB = b.vacina ? b.vacina.toLowerCase() : '';
        return nomeA.localeCompare(nomeB);
    });

    if (state.vacinas.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'empty-state';
        emptyCard.innerHTML = `
            <div class="empty-state-icon">💉</div>
            <div class="empty-state-text">Você ainda não possui vacinas cadastradas.<br>Clique em "+ Adicionar Vacina" para começar!</div>
        `;
        contentArea.appendChild(emptyCard);
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
}

window.adicionarVacina = function() {
    const novaId = Date.now();
    const novaVacina = { id: novaId, vacina: '', lote: '', fabricante: '', validade: '' };
    state.vacinas.push(novaVacina);
    
    const card = document.createElement('div');
    card.className = 'card editing';
    card.id = `vacina-${novaId}`;
    card.innerHTML = gerarHTMLCardVacina(novaVacina, 'edit');
    
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) emptyState.style.display = 'none';

    const cardAdd = document.querySelector('.card-add');
    contentArea.insertBefore(card, cardAdd);
    
    contentArea.scrollTop = contentArea.scrollHeight;
}

window.capitalizarPrimeirasLetras = function(input) {
    const cursor = input.selectionStart;
    const words = input.value.split(' ');
    const conectivos = ['de', 'da', 'do', 'das', 'dos', 'e', 'com', 'para', 'em'];
    
    for (let i = 0; i < words.length; i++) {
        if (words[i].length > 0) {
            let w = words[i]; 
            if (i !== 0 && conectivos.includes(w.toLowerCase())) {
                words[i] = w.toLowerCase();
            } else {
                words[i] = w.charAt(0).toUpperCase() + w.slice(1);
            }
        }
    }
    input.value = words.join(' ');
    input.setSelectionRange(cursor, cursor); 
}

window.formatarData = function(input) {
    let v = input.value.replace(/\D/g, ''); 
    
    if (v.length > 8) v = v.slice(0, 8);

    if (v.length > 4 && v.length <= 6) {
        input.value = v.replace(/^(\d{2})(\d+)/, '$1/$2');
    } 
    else if (v.length > 6) {
        input.value = v.replace(/^(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
    } 
    else if (v.length > 2) {
        input.value = v.replace(/^(\d{2})(\d+)/, '$1/$2');
    } 
    else {
        input.value = v;
    }
}

function gerarHTMLCardVacina(item, estado) {
    const classeValidade = classificarValidade(item.validade);

    if (estado === 'edit') {
        return `
            <div class="card-grid">
                <div class="card-col">
                    <input type="text" id="edit-vacina-${item.id}" class="card-input" placeholder="Vacina" value="${item.vacina}" maxlength="15" oninput="capitalizarPrimeirasLetras(this)">
                </div>
                <div class="card-col">
                    <input type="text" id="edit-lote-${item.id}" class="card-input" placeholder="Lote" value="${item.lote}" maxlength="15">
                </div>
                <div class="card-col">
                    <input type="text" id="edit-fabricante-${item.id}" class="card-input" placeholder="Fabricante" value="${item.fabricante}" maxlength="15">
                </div>
                <div class="card-col text-center">
                    <input type="text" id="edit-validade-${item.id}" class="card-input input-center" placeholder="Validade" value="${item.validade}" oninput="formatarData(this)" maxlength="10">
                </div>
                <div class="card-separator">|</div>
                <div class="card-actions">
                    <button class="btn-action btn-save" onclick="salvarEdicao(${item.id})" title="Salvar">✔</button>
                </div>
            </div>
        `;
    } else if (estado === 'delete') {
        return `
            <div class="card-grid">
                <div class="card-col"><span class="card-value">${item.vacina}</span></div>
                <div class="card-col"><span class="card-value">${item.lote}</span></div>
                <div class="card-col"><span class="card-value">${item.fabricante}</span></div>
                <div class="card-col text-center"><span class="card-value ${classeValidade}">${item.validade}</span></div>
                <div class="card-separator">|</div>
                <div class="card-actions">
                    <span class="confirm-msg">Excluir?</span>
                    <button class="btn-action btn-confirm" onclick="confirmarExclusao(${item.id})" title="Confirmar">✔</button>
                    <button class="btn-action btn-cancel" onclick="mudarEstadoCard(${item.id}, 'view')" title="Cancelar">✖</button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="card-grid">
                <div class="card-col"><span class="card-value" data-label="Vacina">${item.vacina}</span></div>
                <div class="card-col"><span class="card-value" data-label="Lote">${item.lote}</span></div>
                <div class="card-col"><span class="card-value" data-label="Fabricante">${item.fabricante}</span></div>
                <div class="card-col text-center"><span class="card-value ${classeValidade}" data-label="Validade">${item.validade}</span></div>
                <div class="card-separator">|</div>
                <div class="card-actions">
                    <button class="btn-action btn-print" onclick="imprimirVacina(${item.id})" title="Imprimir Etiquetas">🖨️</button>
                    <button class="btn-action btn-edit" onclick="mudarEstadoCard(${item.id}, 'edit')" title="Editar Vacina">✎</button>
                    <button class="btn-action btn-delete" onclick="mudarEstadoCard(${item.id}, 'delete')" title="Excluir Vacina">🗑️</button>
                </div>
            </div>
        `;
    }
}

window.mudarEstadoCard = function(id, estado) {
    const vacina = state.vacinas.find(v => v.id === id);
    if (!vacina) return;
    const card = document.getElementById(`vacina-${id}`);
    if (card) {
        if (estado === 'edit') {
            card.classList.add('editing');
        } else {
            card.classList.remove('editing');
        }
        card.innerHTML = gerarHTMLCardVacina(vacina, estado);
    }
}

window.salvarEdicao = function(id) {
    const vacina = state.vacinas.find(v => v.id === id);
    if (!vacina) return;
    
    vacina.vacina = document.getElementById(`edit-vacina-${id}`).value.trim();
    vacina.lote = document.getElementById(`edit-lote-${id}`).value.trim();
    vacina.fabricante = document.getElementById(`edit-fabricante-${id}`).value.trim();
    vacina.validade = document.getElementById(`edit-validade-${id}`).value.trim();
    
    salvarVacinas();
    renderizarLista(); 
}

window.confirmarExclusao = function(id) {
    const card = document.getElementById(`vacina-${id}`);
    if (card) {
        card.style.transform = 'translateX(-50px)';
        card.style.opacity = '0';
        setTimeout(() => {
            state.vacinas = state.vacinas.filter(v => v.id !== id);
            salvarVacinas();
            renderizarLista(); 
        }, 400);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnBackup = document.getElementById('btnBackup');
    const backupOverlay = document.getElementById('backupOverlay');
    const btnFecharBackup = document.getElementById('btnFecharBackup');
    const btnExportarBackup = document.getElementById('btnExportarBackup');
    const btnImportarBackup = document.getElementById('btnImportarBackup');
    const inputImportarBackup = document.getElementById('inputImportarBackup');

    if (btnBackup) {
        btnBackup.addEventListener('click', () => {
            backupOverlay.classList.add('open');
        });
    }

    if (btnFecharBackup) {
        btnFecharBackup.addEventListener('click', () => {
            backupOverlay.classList.remove('open');
        });
    }

    if (backupOverlay) {
        backupOverlay.addEventListener('click', (e) => {
            if (e.target === backupOverlay) backupOverlay.classList.remove('open');
        });
    }

    if (btnExportarBackup) {
        btnExportarBackup.addEventListener('click', () => {
            if (state.vacinas.length === 0) {
                alert("Você ainda não possui vacinas para exportar!");
                return;
            }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.vacinas, null, 2));
            const dlNode = document.createElement('a');
            dlNode.setAttribute("href", dataStr);
            dlNode.setAttribute("download", "backup_etiqueta_vacinas.json");
            document.body.appendChild(dlNode);
            dlNode.click();
            dlNode.remove();
            backupOverlay.classList.remove('open');
        });
    }

    if (btnImportarBackup && inputImportarBackup) {
        btnImportarBackup.addEventListener('click', () => {
            inputImportarBackup.click();
        });

        inputImportarBackup.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData)) {
                        state.vacinas = importedData;
                        salvarVacinas();
                        renderizarLista();
                        backupOverlay.classList.remove('open');
                        alert("🎉 Backup de vacinas importado com sucesso!");
                    } else {
                        alert("Arquivo inválido! O backup deve ser um arquivo .json válido gerado pelo sistema.");
                    }
                } catch(err) {
                    alert("Erro ao ler o arquivo de backup!");
                }
            };
            reader.readAsText(file);
            e.target.value = ''; 
        });
    }
});