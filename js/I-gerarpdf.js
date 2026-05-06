window.imprimirVacina = function(id) {
    const vacina = state.vacinas.find(v => v.id === id);
    if (!vacina) return;
    const nomeSeguro = (vacina.vacina || 'Desconhecida').replace(/[^a-z0-9]/gi, '_');
    gerarPDFUnificado([vacina], `Etiqueta_${nomeSeguro}.pdf`);
};

window.imprimirRotina = function(id) {
    const rotina = state.rotinas.find(r => r.id === id);
    if (!rotina || !rotina.vacinasIds || rotina.vacinasIds.length === 0) return;
    
    const vacinasParaImprimir = rotina.vacinasIds
        .map(vid => state.vacinas.find(v => v.id === vid))
        .filter(v => v !== undefined);
        
    if (vacinasParaImprimir.length === 0) return;
    const nomeSeguro = (rotina.nome || 'Rotina').replace(/[^a-z0-9]/gi, '_');
    gerarPDFUnificado(vacinasParaImprimir, `Rotina_${nomeSeguro}.pdf`);
};

window.imprimirListaVacinas = function() {
    if (state.vacinas.length === 0) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Lista de Vacinas Cadastradas", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataHoje}`, 105, 26, { align: "center" });

    let startY = 35;
    const rowHeight = 10;
    const colWidths = [50, 40, 40, 25, 25]; 
    const startX = 14;

    doc.setFillColor(230, 230, 230);
    doc.rect(startX, startY, 180, rowHeight, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Vacina", startX + 2, startY + 6.5);
    doc.text("Lote", startX + colWidths[0] + 2, startY + 6.5);
    doc.text("Fabricante", startX + colWidths[0] + colWidths[1] + 2, startY + 6.5);
    doc.text("Via/Local", startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, startY + 6.5);
    doc.text("Validade", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, startY + 6.5);

    startY += rowHeight;
    doc.setFont("helvetica", "normal");

    const vacinas = [...state.vacinas].sort((a, b) => (a.vacina || '').toLowerCase().localeCompare((b.vacina || '').toLowerCase()));

    vacinas.forEach((v, index) => {
        if (startY > 275) {
            doc.addPage();
            startY = 20;
            
            doc.setFillColor(230, 230, 230);
            doc.rect(startX, startY, 180, rowHeight, 'F');
            doc.setFont("helvetica", "bold");
            doc.text("Vacina", startX + 2, startY + 6.5);
            doc.text("Lote", startX + colWidths[0] + 2, startY + 6.5);
            doc.text("Fabricante", startX + colWidths[0] + colWidths[1] + 2, startY + 6.5);
            doc.text("Via/Local", startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, startY + 6.5);
            doc.text("Validade", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, startY + 6.5);
            
            startY += rowHeight;
            doc.setFont("helvetica", "normal");
        }

        if (index % 2 === 0) {
            doc.setFillColor(248, 248, 248);
            doc.rect(startX, startY, 180, rowHeight, 'F');
        }

        doc.text(v.vacina || '', startX + 2, startY + 6.5);
        doc.text(v.lote || '', startX + colWidths[0] + 2, startY + 6.5);
        doc.text(v.fabricante || '', startX + colWidths[0] + colWidths[1] + 2, startY + 6.5);
        
        doc.setFont("helvetica", "bold");
        doc.text(v.via || '-', startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, startY + 4.5);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(v.local || '-', startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, startY + 8.5);
        doc.setFontSize(10);
        
        doc.text(v.validade || '', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, startY + 6.5);

        startY += rowHeight;
    });

    const dataArquivo = dataHoje.replace(/\//g, '-');
    doc.save(`Lista_Vacinas_${dataArquivo}.pdf`);
};

function gerarPDFUnificado(listaVacinas, nomeArquivo) {
    const cfg = configImpresso;
    const cfgFields = cfg.fields || { vacina: true, data: true, lote: true, fabricante: true, vacinador: true };
    const dataAtual = cfg.textoData || new Date().toLocaleDateString('pt-BR');
    const usrV = cfg.nomeVacinador || localStorage.getItem('lf_nome_usuario_vacina') || 'Usuário';

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ 
        orientation: 'p', 
        unit: 'mm', 
        format: [cfg.pageWidth * 10, cfg.pageHeight * 10] 
    });

    const labelsPorPagina = cfg.cols * cfg.rows;
    const mm2pt = 2.83465;
    
    let doseCounter = 0;

    for (let index = 0; index < labelsPorPagina; index++) {
        const col = Math.floor(index / cfg.rows);
        const row = index % cfg.rows;

        const labelX = (cfg.marginLeft + col * (cfg.labelWidth + cfg.gapX)) * 10;
        const labelY = (cfg.marginTop + row * (cfg.labelHeight + cfg.gapY)) * 10;

        const innerStartX = labelX + (cfg.padLeft * 10);
        const innerStartY = labelY + (cfg.padTop * 10);

        for (let dr = 0; dr < cfg.doseRows; dr++) {
            for (let dc = 0; dc < cfg.doseCols; dc++) {
                
                const vacinaAtual = listaVacinas[doseCounter % listaVacinas.length];
                doseCounter++;

                const doseX = innerStartX + (dc * (cfg.doseWidth + cfg.doseGapX) * 10);
                const doseY = innerStartY + (dr * (cfg.doseHeight + cfg.doseGapY) * 10);
                const doseW_mm = cfg.doseWidth * 10;
                const doseH_mm = cfg.doseHeight * 10;

                doc.setLineWidth(0.6);
                doc.setDrawColor(0, 0, 0);
                doc.rect(doseX, doseY, doseW_mm, doseH_mm);

                const textPad_mm = 1.0;
                const contentX = doseX + textPad_mm;
                const contentY = doseY + textPad_mm;
                
                const usableH_mm = doseH_mm - (textPad_mm * 2);
                const usableW_mm = doseW_mm - (textPad_mm * 2);

                const largeCount = (cfgFields.vacina ? 1 : 0) + (cfgFields.data ? 1 : 0);
                const smallCount = (cfgFields.lote ? 1 : 0) + (cfgFields.fabricante ? 1 : 0) + (cfgFields.vacinador ? 1 : 0);
                const totalUnits = (largeCount * 2.0) + (smallCount * 1.5);
                
                const unitH_mm = totalUnits > 0 ? (usableH_mm / totalUnits) : 0;
                const baseLarge_pt = (unitH_mm * 2.0) * mm2pt;
                const baseSmall_pt = (unitH_mm * 1.5) * mm2pt;

                let maxW_mm = 0;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(baseLarge_pt);
                if (cfgFields.vacina) maxW_mm = Math.max(maxW_mm, doc.getTextWidth(vacinaAtual.vacina || ''));
                if (cfgFields.data) maxW_mm = Math.max(maxW_mm, doc.getTextWidth(dataAtual));

                doc.setFont("helvetica", "normal");
                doc.setFontSize(baseSmall_pt);
                if (cfgFields.lote) maxW_mm = Math.max(maxW_mm, doc.getTextWidth(vacinaAtual.lote || ''));
                if (cfgFields.fabricante) maxW_mm = Math.max(maxW_mm, doc.getTextWidth(vacinaAtual.fabricante || ''));
                if (cfgFields.vacinador) maxW_mm = Math.max(maxW_mm, doc.getTextWidth(usrV));

                let globalScale = 1;
                if (maxW_mm > usableW_mm) {
                    globalScale = usableW_mm / maxW_mm;
                }

                const activeItems = [];
                if (cfgFields.vacina) activeItems.push({ text: vacinaAtual.vacina || '', font: 'bold', size: baseLarge_pt * globalScale, color: 0 });
                if (cfgFields.data) activeItems.push({ text: dataAtual, font: 'bold', size: baseLarge_pt * globalScale, color: 0 });
                if (cfgFields.lote) activeItems.push({ text: vacinaAtual.lote || '', font: 'normal', size: baseSmall_pt * globalScale, color: 50 });
                if (cfgFields.fabricante) activeItems.push({ text: vacinaAtual.fabricante || '', font: 'normal', size: baseSmall_pt * globalScale, color: 50 });
                if (cfgFields.vacinador) activeItems.push({ text: usrV, font: 'normal', size: baseSmall_pt * globalScale, color: 50 });

                const count = activeItems.length;
                if (count > 0) {
                    const segmentH = usableH_mm / count;
                    activeItems.forEach((item, idx) => {
                        const y = contentY + (idx * segmentH) + (segmentH / 2);
                        doc.setFont("helvetica", item.font);
                        doc.setFontSize(item.size);
                        doc.setTextColor(item.color, item.color, item.color);
                        doc.text(item.text, contentX, y, { baseline: 'middle' });
                    });
                }
            }
        }
    }

    doc.save(nomeArquivo || "Etiquetas.pdf");
}