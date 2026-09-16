import fs from 'fs';
const files = [
  'src/services/rsDocxGenerator.ts',
  'src/services/dissolutionDocxGenerator.ts',
  'src/services/amvDocxGenerator.ts'
];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(/    new Paragraph\({\n        alignment: AlignmentType.CENTER,\n        spacing: { before: 0, after: 120 },\n        children: \[\n          new TextRun\({\n            text: 'THIS IS A BLANK PROTOCOL. NO ANALYSIS HAS BEEN PERFORMED. ALL DATA FIELDS ARE TO BE COMPLETED BY THE ANALYST.',\n            bold: true,\n            size: 24,\n            font: FONT_FAMILY,\n            color: 'FF0000'\n          }\),\n        \],\n      }\),/, "docElements.push(\n    new Paragraph({\n        alignment: AlignmentType.CENTER,\n        spacing: { before: 0, after: 120 },\n        children: [\n          new TextRun({\n            text: 'THIS IS A BLANK PROTOCOL. NO ANALYSIS HAS BEEN PERFORMED. ALL DATA FIELDS ARE TO BE COMPLETED BY THE ANALYST.',\n            bold: true,\n            size: 24,\n            font: FONT_FAMILY,\n            color: 'FF0000'\n          }),\n        ],\n      })\n  );");

  fs.writeFileSync(file, code);
}
