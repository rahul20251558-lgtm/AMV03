import fs from 'fs';

const files = [
  'src/services/amvDocxGenerator.ts',
  'src/services/rsDocxGenerator.ts',
  'src/services/dissolutionDocxGenerator.ts',
  'src/services/mltDocxGenerator.ts'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace Overall Conclusion & Review Checklist (or Completion Record)
  const checklistReplacement = `
  docElements.push(
    createSectionHeader('Overall Conclusion', 120, 50),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 120 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 240 }, children: [new TextRun({ text: 'To be completed by the analyst after execution.', size: 22, font: FONT_FAMILY, italics: true })] }),
    
    createSectionHeader('Review Checklist', 120, 50),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '[ ] Raw data, calculations & chromatograms reviewed', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '[ ] Electronic audit trail reviewed', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '[ ] Deviation / OOS raised: Yes / No', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 240 }, children: [new TextRun({ text: '[ ] Annexures attached', size: 22, font: FONT_FAMILY })] })
  );
  `;

  // We need to match where `// 13. Overall Conclusion` or `// Section 13 Overall Conclusion` starts,
  // and go up to `// 14. Abbreviations` or `// 15. Abbreviations`.
  
  const regex = /\/\/[^\n]*(?:Overall Conclusion|Completion Record)[\s\S]*?(?=\/\/[^\n]*Abbreviations)/i;
  
  code = code.replace(regex, checklistReplacement + '\n  ');

  // Replace "Complies", "Passes", "Validated", "Confirmed" inside docxGenerator
  // Wait, my forceBlankProtocol handles all the data strings, so we don't need to replace literal strings in docxGenerator if they are driven by data!
  // BUT if there are some hardcoded `(Complies)` in docxGenerator, let's just strip them using regex.
  code = code.replace(/ \(Complies\)/g, '');
  code = code.replace(/ — Complies/g, '');
  code = code.replace(/Complies with/g, 'To be verified against');
  code = code.replace(/'Complies'/g, "'To be verified'");
  code = code.replace(/'Passes'/g, "'To be verified'");
  code = code.replace(/'Validated'/g, "'To be evaluated'");
  code = code.replace(/'Confirmed'/g, "'To be evaluated'");
  code = code.replace(/'Stable for 24h'/g, "'To be evaluated'");

  fs.writeFileSync(file, code);
}
