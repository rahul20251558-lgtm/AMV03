import fs from 'fs';
const files = [
  'src/services/amvDocxGenerator.ts',
  'src/services/rsDocxGenerator.ts',
  'src/services/dissolutionDocxGenerator.ts',
  'src/services/mltDocxGenerator.ts'
];

const replacement = `
    createSectionHeader('Overall Conclusion', 120, 50),
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
    ])
  );
`;

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  const regex = /createSectionHeader\('Overall Conclusion', 120, 50\),[\s\S]*?new Paragraph\(\{ spacing: \{ before: 60, after: 240 \}, children: \[new TextRun\(\{ text: '\[ \] Annexures attached', size: 22, font: FONT_FAMILY \}\)\] \}\)\n\s*\);/g;
  
  if (regex.test(code)) {
    code = code.replace(regex, replacement.trim());
  }
  
  // also replace any occurrences in AMV page 7
  const page7Regex = /createSectionHeader\('13\. Overall Conclusion & Review Checklist', 70, 30\),[\s\S]*?new Paragraph\(\{ spacing: \{ before: 60, after: 240 \}, children: \[new TextRun\(\{ text: '\[ \] Annexures attached', size: 22, font: FONT_FAMILY \}\)\] \}\),/g;
  if (page7Regex.test(code)) {
    code = code.replace(page7Regex, replacement.trim() + ',');
  }
  
  fs.writeFileSync(file, code);
}
