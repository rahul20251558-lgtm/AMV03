import fs from 'fs';
let code = fs.readFileSync('src/services/amvDocxGenerator.ts', 'utf8');

const anchor = `    createSectionHeader('13. Overall Conclusion & Review Checklist', 70, 30),`;
const target = `    createBodyParagraph(\`The analytical method for \${data.productName} Assay by HPLC is specific, linear, precise, accurate, robust, and stable, meeting all acceptance criteria as per ICH Q2(R2) and USP compendial standards.\`, 20, 40),
    checkTable,`;

const replacement = `
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '[ ] Raw data, calculations & chromatograms reviewed', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '[ ] Electronic audit trail reviewed', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '[ ] Deviation / OOS raised: Yes / No', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 240 }, children: [new TextRun({ text: '[ ] Annexures attached', size: 22, font: FONT_FAMILY })] }),
    
    createSectionHeader('Overall Conclusion', 70, 30),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 120 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 240 }, children: [new TextRun({ text: 'To be completed by the analyst after execution.', size: 22, font: FONT_FAMILY, italics: true })] }),
`;

code = code.replace(target, replacement);

fs.writeFileSync('src/services/amvDocxGenerator.ts', code);
