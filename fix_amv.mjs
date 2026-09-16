import fs from 'fs';
let code = fs.readFileSync('src/services/amvDocxGenerator.ts', 'utf8');

code = code.replace(/    new Paragraph\({\n        alignment: AlignmentType.CENTER,\n        spacing: { before: 0, after: 120 },\n        children: \[\n          new TextRun\({\n            text: 'THIS IS A BLANK PROTOCOL. NO ANALYSIS HAS BEEN PERFORMED. ALL DATA FIELDS ARE TO BE COMPLETED BY THE ANALYST.',\n            bold: true,\n            size: 24,\n            font: FONT_FAMILY,\n          }\),\n        \],\n      }\),/, "docElements.push(\n    new Paragraph({\n        alignment: AlignmentType.CENTER,\n        spacing: { before: 0, after: 120 },\n        children: [\n          new TextRun({\n            text: 'THIS IS A BLANK PROTOCOL. NO ANALYSIS HAS BEEN PERFORMED. ALL DATA FIELDS ARE TO BE COMPLETED BY THE ANALYST.',\n            bold: true,\n            size: 24,\n            font: FONT_FAMILY,\n          }),\n        ],\n      })\n  );");

fs.writeFileSync('src/services/amvDocxGenerator.ts', code);
