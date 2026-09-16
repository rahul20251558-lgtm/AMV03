import fs from 'fs';
const files = [
  'src/services/amvDocxGenerator.ts',
  'src/services/rsDocxGenerator.ts',
  'src/services/dissolutionDocxGenerator.ts',
  'src/services/mltDocxGenerator.ts'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  const badRegex = /    createSectionHeader\('Overall Conclusion', 120, 50\),[\s\S]*?createDataCell\('____ of ____ pages', AlignmentType\.LEFT, false, undefined, 4906\)\n      \]\)\n    \]\)\n  \);\,[\s\S]*?new Paragraph\(\{ spacing: \{ before: 60, after: 240 \}, children: \[new TextRun\(\{ text: 'To be completed by the analyst after execution\.', size: 22, font: FONT_FAMILY, italics: true \}\)\] \}\),/g;
  
  if (badRegex.test(code)) {
    code = code.replace(badRegex, `    createSectionHeader('Overall Conclusion', 120, 50),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 120 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 240 }, children: [new TextRun({ text: 'To be completed by the analyst after execution.', size: 22, font: FONT_FAMILY, italics: true })] }),
    
    createSectionHeader('Review Checklist', 120, 50),
    createDocxTable([5000, 4906], [
      createRow([
        createDataCell('Raw data & chromatograms reviewed', AlignmentType.LEFT, false, undefined, 5000),
        createDataCell('[ ] Yes  [ ] No    Initials ____', AlignmentType.LEFT, false, undefined, 4906)
      ]),
      createRow([
        createDataCell('Audit trail reviewed', AlignmentType.LEFT, false, undefined, 5000),
        createDataCell('[ ] Yes  [ ] No    Initials ____', AlignmentType.LEFT, false, undefined, 4906)
      ]),
      createRow([
        createDataCell('Deviation / OOS raised', AlignmentType.LEFT, false, undefined, 5000),
        createDataCell('[ ] None  [ ] Ref No: _________', AlignmentType.LEFT, false, undefined, 4906)
      ]),
      createRow([
        createDataCell('Annexures attached', AlignmentType.LEFT, false, undefined, 5000),
        createDataCell('____ of ____ pages', AlignmentType.LEFT, false, undefined, 4906)
      ])
    ]),`);
  } else {
    const badRegex2 = /    createSectionHeader\('Overall Conclusion', 120, 50\),[\s\S]*?createDataCell\('____ of ____ pages', AlignmentType\.LEFT, false, undefined, 4906\)\n      \]\)\n    \]\)\n  \);/g;
    if (badRegex2.test(code)) {
        code = code.replace(badRegex2, `    createSectionHeader('Overall Conclusion', 120, 50),
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 120 }, children: [new TextRun({ text: '____________________________________________________________________', size: 22, font: FONT_FAMILY })] }),
    new Paragraph({ spacing: { before: 60, after: 240 }, children: [new TextRun({ text: 'To be completed by the analyst after execution.', size: 22, font: FONT_FAMILY, italics: true })] }),
    
    createSectionHeader('Review Checklist', 120, 50),
    createDocxTable([5000, 4906], [
      createRow([
        createDataCell('Raw data & chromatograms reviewed', AlignmentType.LEFT, false, undefined, 5000),
        createDataCell('[ ] Yes  [ ] No    Initials ____', AlignmentType.LEFT, false, undefined, 4906)
      ]),
      createRow([
        createDataCell('Audit trail reviewed', AlignmentType.LEFT, false, undefined, 5000),
        createDataCell('[ ] Yes  [ ] No    Initials ____', AlignmentType.LEFT, false, undefined, 4906)
      ]),
      createRow([
        createDataCell('Deviation / OOS raised', AlignmentType.LEFT, false, undefined, 5000),
        createDataCell('[ ] None  [ ] Ref No: _________', AlignmentType.LEFT, false, undefined, 4906)
      ]),
      createRow([
        createDataCell('Annexures attached', AlignmentType.LEFT, false, undefined, 5000),
        createDataCell('____ of ____ pages', AlignmentType.LEFT, false, undefined, 4906)
      ])
    ])`);
    }
  }

  // Remove other invalid instances
  code = code.replace(/\]\)\n    \]\)\n  \);\,/g, '])\n    ]),');
  code = code.replace(/\]\)\n    \]\)\n  \);/g, '])\n    ])\n  );');
  
  fs.writeFileSync(file, code);
}
