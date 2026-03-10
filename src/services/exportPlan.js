import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// ═══════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════

function setupPDF(title) {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(6, 214, 160);
    doc.text('ShadowFitness', 14, 20);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text(title, 14, 32);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Generated: ' + new Date().toLocaleDateString(), 14, 40);
    doc.setDrawColor(6, 214, 160);
    doc.line(14, 44, 196, 44);
    return doc;
}

function safeTxt(text) {
    // Strip emoji/unicode chars that jsPDF can't render
    return String(text || '').replace(/[^\x00-\x7F]/g, '').trim() || '-';
}

function getSafeFilename(prefix, clientName, ext) {
    const cleanName = String(clientName || 'Unknown')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_');
    return `${prefix}_${cleanName}.${ext}`;
}

function checkPage(doc, y, margin = 250) {
    if (y > margin) { doc.addPage(); return 20; }
    return y;
}

export function exportWorkoutPDF(plan, clientName) {
    try {
        console.log('[Export] Starting workout PDF export for:', clientName);
        const doc = setupPDF('Workout Plan - ' + safeTxt(clientName));
        let y = 52;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(safeTxt(plan.summary), 180);
        doc.text(summaryLines, 14, y);
        y += summaryLines.length * 5 + 8;

        (plan.weeklySchedule || []).forEach(day => {
            y = checkPage(doc, y);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(6, 214, 160);
            doc.text(safeTxt(day.day + ' - ' + day.focus), 14, y);
            y += 6;
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Duration: ' + safeTxt(day.duration) + ' | Warmup: ' + safeTxt(day.warmup), 14, y);
            y += 6;

            if (day.exercises?.length) {
                try {
                    const tableBody = day.exercises.map(e => [
                        safeTxt(e.name), String(e.sets || ''), safeTxt(e.reps),
                        safeTxt(e.rest), safeTxt(e.tempo), safeTxt(e.notes)
                    ]);
                    doc.autoTable({
                        startY: y,
                        head: [['Exercise', 'Sets', 'Reps', 'Rest', 'Tempo', 'Notes']],
                        body: tableBody,
                        theme: 'striped',
                        headStyles: { fillColor: [6, 214, 160], textColor: [0, 0, 0], fontSize: 8 },
                        bodyStyles: { fontSize: 7 },
                        margin: { left: 14 },
                    });
                    y = (doc.lastAutoTable?.finalY || y) + 10;
                } catch (tableErr) {
                    console.warn('[Export] autoTable fallback for day:', day.day, tableErr);
                    day.exercises.forEach(e => {
                        y = checkPage(doc, y);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8);
                        doc.setTextColor(60, 60, 60);
                        doc.text(safeTxt(e.name) + ' - ' + (e.sets || '') + 'x' + safeTxt(e.reps) + ' | Rest: ' + safeTxt(e.rest), 18, y);
                        y += 4;
                    });
                    y += 6;
                }
            }
        });

        if (plan.cardioRecommendations) {
            y = checkPage(doc, y, 240);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(6, 214, 160);
            doc.text('Cardio Recommendations', 14, y); y += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            const cr = plan.cardioRecommendations;
            doc.text('Protocol: ' + safeTxt(cr.protocol), 14, y); y += 5;
            doc.text('Weekly Target: ' + safeTxt(cr.weeklyTarget), 14, y); y += 5;
            const rationale = doc.splitTextToSize('Rationale: ' + safeTxt(cr.fatLossRationale), 180);
            doc.text(rationale, 14, y); y += rationale.length * 4 + 4;
            (cr.sessions || []).forEach(s => {
                const line = '- ' + safeTxt(s.type) + ' | ' + safeTxt(s.duration) + ', ' + safeTxt(s.intensity) + ', ' + safeTxt(s.frequency);
                doc.text(line, 18, y); y += 5;
            });
            y += 5;
        }

        if (plan.warnings?.length) {
            y = checkPage(doc, y);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(220, 50, 50);
            doc.text('WARNINGS & SAFETY', 14, y); y += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            plan.warnings.forEach(w => {
                const lines = doc.splitTextToSize('- ' + safeTxt(w), 176);
                doc.text(lines, 18, y);
                y += lines.length * 4 + 2;
            });
        }

        console.log('[Export] Saving workout PDF');
        doc.save(getSafeFilename('ShadowFitness_Workout', clientName, 'pdf'));
    } catch (err) {
        console.error('[Export] PDF export failed:', err);
        alert('PDF export failed: ' + err.message);
    }
}

export function exportMealPDF(plan, clientName) {
    try {
        const doc = setupPDF('Meal Plan - ' + safeTxt(clientName));
        let y = 52;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const summaryLines = doc.splitTextToSize(safeTxt(plan.summary), 180);
        doc.text(summaryLines, 14, y);
        y += summaryLines.length * 5 + 4;

        if (plan.dailyTargets) {
            const t = plan.dailyTargets;
            doc.setFont('helvetica', 'bold');
            doc.text('Daily Targets: ' + t.calories + ' kcal | P: ' + t.protein + ' | C: ' + t.carbs + ' | F: ' + t.fat, 14, y);
            y += 8;
        }

        (plan.meals || []).forEach(meal => {
            y = checkPage(doc, y, 240);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(6, 214, 160);
            doc.text(safeTxt(meal.name) + ' (' + safeTxt(meal.time) + ') - ' + meal.totalCalories + ' kcal', 14, y);
            y += 6;

            if (meal.foods?.length) {
                doc.autoTable({
                    startY: y,
                    head: [['Food Item', 'Amount', 'Cal', 'Protein', 'Carbs', 'Fat']],
                    body: meal.foods.map(f => [
                        safeTxt(f.item), safeTxt(f.amount), String(f.calories),
                        f.protein + 'g', f.carbs + 'g', f.fat + 'g'
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [6, 214, 160], textColor: [0, 0, 0], fontSize: 8 },
                    bodyStyles: { fontSize: 7 },
                    margin: { left: 14 },
                });
                y = doc.lastAutoTable.finalY + 4;
            }
            if (meal.foodMechanics) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                const fm = doc.splitTextToSize('Food Mechanics: ' + safeTxt(meal.foodMechanics), 176);
                doc.text(fm, 18, y);
                y += fm.length * 3.5 + 6;
            }
        });

        if (plan.drugNutrientWarnings?.length) {
            y = checkPage(doc, y, 240);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(220, 50, 50);
            doc.text('DRUG-NUTRIENT INTERACTIONS', 14, y); y += 6;
            doc.autoTable({
                startY: y,
                head: [['Medication', 'Interaction', 'Action Taken', 'Severity']],
                body: plan.drugNutrientWarnings.map(w => [
                    safeTxt(w.medication), safeTxt(w.interaction), safeTxt(w.action), safeTxt(w.severity)
                ]),
                theme: 'striped',
                headStyles: { fillColor: [220, 50, 50], textColor: [255, 255, 255], fontSize: 8 },
                bodyStyles: { fontSize: 7 },
                margin: { left: 14 },
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        if (plan.supplements?.length) {
            y = checkPage(doc, y);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(6, 214, 160);
            doc.text('Supplements', 14, y); y += 6;
            doc.autoTable({
                startY: y,
                head: [['Supplement', 'Dosage', 'Timing', 'Reason']],
                body: plan.supplements.map(s => [safeTxt(s.name), safeTxt(s.dosage), safeTxt(s.timing), safeTxt(s.reason)]),
                theme: 'striped',
                headStyles: { fillColor: [6, 214, 160], textColor: [0, 0, 0], fontSize: 8 },
                bodyStyles: { fontSize: 7 },
                margin: { left: 14 },
            });
        }

        doc.save(getSafeFilename('ShadowFitness_MealPlan', clientName, 'pdf'));
    } catch (err) {
        console.error('PDF export failed:', err);
        alert('PDF export failed: ' + err.message);
    }
}

// ═══════════════════════════════════
// DOCX EXPORT
// ═══════════════════════════════════

function heading(text, level = HeadingLevel.HEADING_2, color = '06D6A0') {
    return new Paragraph({
        heading: level,
        children: [new TextRun({ text: String(text || ''), bold: true, color, font: 'Calibri' })],
        spacing: { before: 300, after: 100 },
    });
}

function para(text, opts = {}) {
    return new Paragraph({
        children: [new TextRun({ text: String(text || ''), font: 'Calibri', size: 20, ...opts })],
        spacing: { after: 80 },
    });
}

function makeTable(headers, rows) {
    const safeRows = rows.map(row =>
        row.map(cell => String(cell ?? ''))
    );
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: headers.map(h => new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: 'Calibri', size: 18, color: 'FFFFFF' })] })],
                    shading: { fill: '06D6A0' },
                })),
            }),
            ...safeRows.map(row => new TableRow({
                children: row.map(cell => new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: cell, font: 'Calibri', size: 18 })] })],
                })),
            })),
        ],
    });
}

export async function exportWorkoutDOCX(plan, clientName) {
    try {
        const children = [];
        children.push(heading('ShadowFitness - Workout Plan', HeadingLevel.HEADING_1));
        children.push(para('Client: ' + clientName + ' | Generated: ' + new Date().toLocaleDateString()));
        children.push(para(plan.summary || '', { italics: true }));

        (plan.weeklySchedule || []).forEach(day => {
            children.push(heading((day.day || '') + ' - ' + (day.focus || '')));
            children.push(para('Duration: ' + (day.duration || 'N/A') + ' | Warmup: ' + (day.warmup || 'N/A')));
            if (day.exercises?.length) {
                children.push(makeTable(
                    ['Exercise', 'Sets', 'Reps', 'Rest', 'Tempo', 'Notes'],
                    day.exercises.map(e => [e.name, e.sets, e.reps, e.rest, e.tempo || '', e.notes || ''])
                ));
            }
        });

        if (plan.cardioRecommendations) {
            const cr = plan.cardioRecommendations;
            children.push(heading('Cardio Recommendations'));
            children.push(para('Protocol: ' + (cr.protocol || 'N/A') + ' | Weekly Target: ' + (cr.weeklyTarget || 'N/A')));
            (cr.sessions || []).forEach(s => {
                children.push(para('- ' + (s.type || '') + ' | ' + (s.duration || '') + ', ' + (s.intensity || '') + ', ' + (s.frequency || '')));
            });
            if (cr.fatLossRationale) children.push(para('Rationale: ' + cr.fatLossRationale, { italics: true }));
        }

        if (plan.warnings?.length) {
            children.push(heading('Warnings', HeadingLevel.HEADING_2, 'DC3232'));
            plan.warnings.forEach(w => children.push(para('- ' + w, { color: 'DC3232' })));
        }

        console.log('[Export] Packing workout DOCX with', children.length, 'elements');
        const doc = new Document({ sections: [{ children }] });
        const blob = await Packer.toBlob(doc);
        saveAs(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), getSafeFilename('ShadowFitness_Workout', clientName, 'docx'));
    } catch (err) {
        console.error('DOCX export failed:', err);
        alert('DOCX export failed: ' + err.message);
    }
}

export async function exportMealDOCX(plan, clientName) {
    try {
        const children = [];
        children.push(heading('ShadowFitness - Meal Plan', HeadingLevel.HEADING_1));
        children.push(para('Client: ' + clientName + ' | Generated: ' + new Date().toLocaleDateString()));
        children.push(para(plan.summary || '', { italics: true }));

        if (plan.dailyTargets) {
            const t = plan.dailyTargets;
            children.push(para('Daily Targets: ' + t.calories + ' kcal | P: ' + t.protein + ' | C: ' + t.carbs + ' | F: ' + t.fat, { bold: true }));
        }

        (plan.meals || []).forEach(meal => {
            children.push(heading((meal.name || '') + ' (' + (meal.time || '') + ') - ' + (meal.totalCalories || 0) + ' kcal'));
            if (meal.foods?.length) {
                children.push(makeTable(
                    ['Food Item', 'Amount', 'Calories', 'Protein', 'Carbs', 'Fat'],
                    meal.foods.map(f => [f.item, f.amount, f.calories, f.protein + 'g', f.carbs + 'g', f.fat + 'g'])
                ));
            }
            if (meal.foodMechanics) children.push(para('Food Mechanics: ' + meal.foodMechanics, { italics: true, color: '888888' }));
        });

        if (plan.drugNutrientWarnings?.length) {
            children.push(heading('Drug-Nutrient Interactions', HeadingLevel.HEADING_2, 'DC3232'));
            children.push(makeTable(
                ['Medication', 'Interaction', 'Action', 'Severity'],
                plan.drugNutrientWarnings.map(w => [w.medication, w.interaction, w.action, w.severity])
            ));
        }

        if (plan.supplements?.length) {
            children.push(heading('Supplements'));
            children.push(makeTable(
                ['Supplement', 'Dosage', 'Timing', 'Reason'],
                plan.supplements.map(s => [s.name, s.dosage, s.timing, s.reason])
            ));
        }

        console.log('[Export] Packing meal DOCX with', children.length, 'elements');
        const doc = new Document({ sections: [{ children }] });
        const blob = await Packer.toBlob(doc);
        saveAs(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), getSafeFilename('ShadowFitness_MealPlan', clientName, 'docx'));
    } catch (err) {
        console.error('DOCX export failed:', err);
        alert('DOCX export failed: ' + err.message);
    }
}
