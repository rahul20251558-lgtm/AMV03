import fs from 'fs';
let code = fs.readFileSync('src/services/rsDocxGenerator.ts', 'utf8');

const oldHeader = `
  // ================= PAGE 1 =================
  // Company Header
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 30 },
      children: [
        new TextRun({
          text: data.companyName,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
          color: navyTextColor,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 10, after: 100 },
      children: [
        new TextRun({
          text: isProtocol
            ? 'ANALYTICAL METHOD VALIDATION PROTOCOL'
            : 'ANALYTICAL METHOD VALIDATION REPORT',
          bold: true,
          size: 24,
          font: FONT_FAMILY,
          color: navyTextColor,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 140 },
      children: [
        new TextRun({
          text: data.subTitle,
          bold: true,
          size: 22,
          font: FONT_FAMILY,
          color: '4B5563',
        }),
      ],
    })
  );`;

const newHeader = `
  // ================= PAGE 1 =================
  // Company Header (Skip for westcoast, already included in the table)
  if (!isWestcoast) {
    docElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 30 },
        children: [
          new TextRun({
            text: data.companyName,
            bold: true,
            size: 28,
            font: FONT_FAMILY,
            color: navyTextColor,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 10, after: 100 },
        children: [
          new TextRun({
            text: isProtocol
              ? 'ANALYTICAL METHOD VALIDATION PROTOCOL'
              : 'ANALYTICAL METHOD VALIDATION REPORT',
            bold: true,
            size: 24,
            font: FONT_FAMILY,
            color: navyTextColor,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 140 },
        children: [
          new TextRun({
            text: data.subTitle,
            bold: true,
            size: 22,
            font: FONT_FAMILY,
            color: '4B5563',
          }),
        ],
      })
    );
  }`;

code = code.replace(oldHeader.trim(), newHeader.trim());
fs.writeFileSync('src/services/rsDocxGenerator.ts', code);
