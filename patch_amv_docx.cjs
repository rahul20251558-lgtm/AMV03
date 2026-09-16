const fs = require('fs');

let docx = fs.readFileSync('src/services/amvDocxGenerator.ts', 'utf8');

docx = docx.replace(/createRow\(\[createDataCell\('Run Time'.*?\),/s, '');
docx = docx.replace(/createRow\(\[createDataCell\('Diluent'.*?\),/s, '');
docx = docx.replace(/createRow\(\[createDataCell\('Working Concentration'.*?\),/s, '');
docx = docx.replace(/createRow\(\[createDataCell\('Approx\. Retention Time'.*?\),/s, '');

// Also add a paragraph below the table
const paragraphJs = `  ]);
  
  const additionalInfoParagraph = new Paragraph({
    children: [
      new TextRun({ text: "The run time for the analysis is ", size: 22 }),
      new TextRun({ text: c.runTime, size: 22, bold: true }),
      new TextRun({ text: ". The diluent used is ", size: 22 }),
      new TextRun({ text: c.diluent, size: 22, bold: true }),
      new TextRun({ text: " to achieve a working concentration of ", size: 22 }),
      new TextRun({ text: c.workingConcentration, size: 22, bold: true }),
      new TextRun({ text: ". The approximate retention time of the main peak is ", size: 22 }),
      new TextRun({ text: c.approxRetentionTime || '6.5 min', size: 22, bold: true }),
      new TextRun({ text: ".", size: 22 }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 200, after: 100 },
  });

  const noteParagraph = new Paragraph({
    children: [
      new TextRun({ text: "Note: " + (c.note || 'Dissolve 1.36 g of Potassium Dihydrogen Phosphate in 1000 mL water, adjust pH to 6.0 with 0.1M KOH.'), italics: true, size: 20, color: "555555" }),
    ],
    spacing: { before: 100, after: 200 },
  });`;

docx = docx.replace(/ {2}\]\);\s*\/\/ 4\.2 Preparation of Solutions Table/s, `${paragraphJs}\n\n  // 4.2 Preparation of Solutions Table`);

fs.writeFileSync('src/services/amvDocxGenerator.ts', docx);
console.log("Patched Docx");
