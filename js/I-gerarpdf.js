window.imprimirVacina = function(id) {
    const vacina = state.vacinas.find(v => v.id === id);
    if (!vacina) return;

    const nomeVacinador = localStorage.getItem('lf_nome_usuario_vacina') || 'Usuario';
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const { jsPDF } = window.jspdf;
    const cfg = configImpresso;
    
    const doc = new jsPDF({ 
        orientation: 'p', 
        unit: 'cm', 
        format: [cfg.pageWidth, cfg.pageHeight] 
    });

    const labelsPorPagina = cfg.cols * cfg.rows;
    const cm2pt = 28.3465;

    for (let index = 0; index < labelsPorPagina; index++) {
        const col = Math.floor(index / cfg.rows);
        const row = index % cfg.rows;

        const labelX = cfg.marginLeft + col * (cfg.labelWidth + cfg.gapX);
        const labelY = cfg.marginTop + row * (cfg.labelHeight + cfg.gapY);

        const innerStartX = labelX + cfg.padLeft;
        const innerStartY = labelY + cfg.padTop;

        for (let dr = 0; dr < cfg.doseRows; dr++) {
            for (let dc = 0; dc < cfg.doseCols; dc++) {
                const doseX = innerStartX + (dc * (cfg.doseWidth + cfg.doseGapX));
                const doseY = innerStartY + (dr * (cfg.doseHeight + cfg.doseGapY));

                // Borda do Carimbo
                doc.setLineWidth(0.01);
                doc.setDrawColor(180, 180, 180);
                doc.setLineDashPattern([0.1, 0.1], 0);
                doc.rect(doseX, doseY, cfg.doseWidth, cfg.doseHeight);
                doc.setLineDashPattern([], 0); 

                // Margem de segurança para o texto não colar na borda
                const textPad = 0.1;
                const contentX = doseX + textPad;
                const contentY = doseY + textPad;
                
                const usableH = cfg.doseHeight - (textPad * 2);
                const usableW = cfg.doseWidth - (textPad * 2);

                // Altura Base: O divisor 9.0 garante que as 5 linhas caibam com respiro
                const unitH = usableH / 9.0;
                const baseLarge_pt = (unitH * 2.0) * cm2pt;
                const baseSmall_pt = (unitH * 1.5) * cm2pt;

                // Mede a largura exata de cada palavra no PDF (Retorna em Centímetros)
                doc.setFont("helvetica", "bold");
                doc.setFontSize(baseLarge_pt);
                const wVac = doc.getTextWidth(vacina.vacina.toUpperCase());
                const wDat = doc.getTextWidth(dataAtual);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(baseSmall_pt);
                const wLot = doc.getTextWidth(vacina.lote);
                const wFab = doc.getTextWidth(vacina.fabricante);
                const wUsr = doc.getTextWidth(nomeVacinador.toUpperCase());

                // Pega a palavra mais comprida para definir a escala
                const maxW_cm = Math.max(wVac, wDat, wLot, wFab, wUsr);

                // Escala Global: Se a palavra transbordar, o bloco TODO encolhe por igual
                let globalScale = 1;
                if (maxW_cm > usableW) {
                    globalScale = usableW / maxW_cm;
                }

                const fLarge = baseLarge_pt * globalScale;
                const fSmall = baseSmall_pt * globalScale;

                // Posições exatas baseadas na altura (0%, 24%, 52%, 70%, 88%)
                const y1 = contentY + (usableH * 0.0);
                const y2 = contentY + (usableH * 0.24);
                const y3 = contentY + (usableH * 0.52);
                const y4 = contentY + (usableH * 0.70);
                const y5 = contentY + (usableH * 0.88);

                doc.setFontSize(fLarge);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0, 0, 0);
                doc.text(vacina.vacina.toUpperCase(), contentX, y1, { baseline: 'top' });
                doc.text(dataAtual, contentX, y2, { baseline: 'top' });

                doc.setFontSize(fSmall);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(50, 50, 50);
                doc.text(vacina.lote, contentX, y3, { baseline: 'top' });
                doc.text(vacina.fabricante, contentX, y4, { baseline: 'top' });
                doc.text(nomeVacinador.toUpperCase(), contentX, y5, { baseline: 'top' });
            }
        }
    }

    window.open(URL.createObjectURL(doc.output("blob")));
};