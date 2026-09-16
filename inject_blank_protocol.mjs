import fs from 'fs';

const files = [
  'src/services/amvDocxGenerator.ts',
  'src/services/rsDocxGenerator.ts',
  'src/services/dissolutionDocxGenerator.ts',
  'src/services/mltDocxGenerator.ts'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Inject the warning paragraph right before the metadata block.
  // The easiest anchor is where the title paragraph ends. 
  // In `amvDocxGenerator.ts`: `font: FONT_FAMILY,\n          }),\n        ],\n      }),`
  // We can search for `text: isProtocol` or something similar.
  // Actually, let's just insert it before `// Metadata Table` or `const metaTable` or `const metaRows` or `// Section 1. Objective`.
  
  const anchor = 'const metaRows';
  const warningText = `
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: 'THIS IS A BLANK PROTOCOL. NO ANALYSIS HAS BEEN PERFORMED. ALL DATA FIELDS ARE TO BE COMPLETED BY THE ANALYST.',
            bold: true,
            size: 24,
            font: FONT_FAMILY,
            color: 'FF0000'
          }),
        ],
      }),
  `;
  
  if (code.includes(anchor)) {
    code = code.replace(anchor, warningText + anchor);
  } else if (code.includes('const createMetaTable')) {
    code = code.replace('const createMetaTable', warningText + 'const createMetaTable');
  } else if (code.includes('const metaTable')) {
    code = code.replace('const metaTable', warningText + 'const metaTable');
  }

  // Next, replace the Review Checklist logic.
  // We can replace the checklist rendering blocks.
  
  fs.writeFileSync(file, code);
}
