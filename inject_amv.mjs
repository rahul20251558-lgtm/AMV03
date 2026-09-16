import fs from 'fs';
let code = fs.readFileSync('src/services/amvDocxGenerator.ts', 'utf8');

const anchor = 'const colMeta =';
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
          }),
        ],
      }),
  `;

code = code.replace(anchor, warningText + anchor);
fs.writeFileSync('src/services/amvDocxGenerator.ts', code);
