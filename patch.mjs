import fs from 'fs';

let code = fs.readFileSync('src/services/rsDocxGenerator.ts', 'utf8');

code = code.replace(
  "const isBlue = theme === 'blue';",
  "const isBlue = theme === 'blue';\n  const isWestcoast = theme === 'westcoast';"
);

const oldMeta = `
  // Metadata Table
  const metaColWidths = [2800, 7106];
  const metaRows: TableRow[] = [
    createRow([
      createDataCell(isProtocol ? 'Protocol No.' : 'Report No.', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(singleDocNumber, AlignmentType.LEFT, true, undefined, 7106),
    ]),
    createRow([
      createDataCell(isProtocol ? 'Protocol Date' : 'Report Date', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(isProtocol ? data.protocolDate : data.reportDate, AlignmentType.LEFT, false, undefined, 7106),
    ]),
    createRow([
      createDataCell('Product Name', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.productName, AlignmentType.LEFT, true, undefined, 7106),
    ]),
    createRow([
      createDataCell('Label Claim', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.labelClaim, AlignmentType.LEFT, false, undefined, 7106),
    ]),
    createRow([
      createDataCell('Test Parameter', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.testParameter, AlignmentType.LEFT, false, undefined, 7106),
    ]),
    createRow([
      createDataCell('Reference', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.reference, AlignmentType.LEFT, false, undefined, 7106),
    ]),
    createRow([
      createDataCell(isProtocol ? 'Batch No. to be used' : 'Batch No. used', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(isProtocol ? '' : data.batchNoUsed, AlignmentType.LEFT, true, undefined, 7106),
    ]),
  ];
  docElements.push(createDocxTable(metaColWidths, metaRows));

  // Approval Table (4 Persons matching PDF)
  docElements.push(createSectionHeader('APPROVALS / SIGN-OFF', 140, 60));
  const signColWidths = [2200, 2600, 2600, 2506];
  const signRows: TableRow[] = [
    createRow([
      createHeaderCell('Activity', 2200),
      createHeaderCell('Designation', 2600),
      createHeaderCell('Name', 2600),
      createHeaderCell('Signature & Date', 2506),
    ], true),
    createRow([
      createDataCell('Prepared By', AlignmentType.LEFT, true, undefined, 2200),
      createDataCell(data.signOffs.preparedBy.designation, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(data.signOffs.preparedBy.name, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? \`\${data.signOffs.preparedBy.name} / \${data.signOffs.preparedBy.dateProtocol || data.protocolDate}\` : \`\${data.signOffs.preparedBy.name} / \${data.signOffs.preparedBy.dateReport || data.signOffs.preparedBy.date}\`, AlignmentType.CENTER, false, undefined, 2506),
    ]),
    createRow([
      createDataCell('Checked By', AlignmentType.LEFT, true, undefined, 2200),
      createDataCell(data.signOffs.checkedBy.designation, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(data.signOffs.checkedBy.name, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? \`\${data.signOffs.checkedBy.name} / \${data.signOffs.checkedBy.dateProtocol || data.protocolDate}\` : \`\${data.signOffs.checkedBy.name} / \${data.signOffs.checkedBy.dateReport || data.signOffs.checkedBy.date}\`, AlignmentType.CENTER, false, undefined, 2506),
    ]),
    createRow([
      createDataCell('Reviewed By', AlignmentType.LEFT, true, undefined, 2200),
      createDataCell(data.signOffs.reviewedBy.designation, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(data.signOffs.reviewedBy.name, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? \`\${data.signOffs.reviewedBy.name} / \${data.signOffs.reviewedBy.dateProtocol || data.protocolDate}\` : \`\${data.signOffs.reviewedBy.name} / \${data.signOffs.reviewedBy.dateReport || data.signOffs.reviewedBy.date}\`, AlignmentType.CENTER, false, undefined, 2506),
    ]),
    createRow([
      createDataCell('Authorised By', AlignmentType.LEFT, true, undefined, 2200),
      createDataCell(data.signOffs.authorisedBy.designation, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(data.signOffs.authorisedBy.name, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? \`\${data.signOffs.authorisedBy.name} / \${data.signOffs.authorisedBy.dateProtocol || data.protocolDate}\` : \`\${data.signOffs.authorisedBy.name} / \${data.signOffs.authorisedBy.dateReport || data.signOffs.authorisedBy.date}\`, AlignmentType.CENTER, false, undefined, 2506),
    ]),
  ];
  docElements.push(createDocxTable(signColWidths, signRows));`;

const newMeta = `
  if (isWestcoast) {
    // Westcoast EXACT Format Layout
    const wcMetaColWidths = [1800, 3106, 2000, 3000]; // 4 cols, total 9906
    
    // Custom cell creator for the Westcoast metadata table
    const createWCCell = (text: string, colSpan: number, bold: boolean, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT, width?: number) => {
      return new TableCell({
        columnSpan: colSpan,
        borders: cellBorder,
        margins: cellMargins,
        width: width ? { size: width, type: WidthType.DXA } : undefined,
        children: [
          new Paragraph({
            alignment: align,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: text || ' ',
                bold: bold,
                size: TABLE_CELL_SIZE,
                font: FONT_FAMILY,
                color: '000000',
              })
            ]
          })
        ]
      });
    };

    const wcMetaTable = new Table({
      width: { size: 9906, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            createWCCell(\`ANALYTICAL METHOD VERIFICATION \${isProtocol ? 'PROTOCOL' : 'REPORT'}\\n(For Related Substance Method)\`, 4, true, AlignmentType.CENTER)
          ]
        }),
        new TableRow({
          children: [
            createWCCell('Product Name', 1, true),
            createWCCell(data.productName, 3, false)
          ]
        }),
        new TableRow({
          children: [
            createWCCell('Test', 1, true),
            createWCCell(data.testParameter, 3, false)
          ]
        }),
        new TableRow({
          children: [
            createWCCell(isProtocol ? 'Protocol No.' : 'Report No.', 1, true, AlignmentType.LEFT, 1800),
            createWCCell(singleDocNumber, 1, false, AlignmentType.LEFT, 3106),
            createWCCell(isProtocol ? 'Protocol Date' : 'Report Date', 1, true, AlignmentType.LEFT, 2000),
            createWCCell(isProtocol ? data.protocolDate : data.reportDate, 1, false, AlignmentType.LEFT, 3000)
          ]
        })
      ]
    });
    
    docElements.push(wcMetaTable);
    docElements.push(new Paragraph({ spacing: { before: 400, after: 0 } })); // spacer

    const wcSignColWidths = [1500, 2500, 2000, 2000, 1906];
    const wcSignRows: TableRow[] = [
      createRow([
        createWCCell('ACTIVITY', 1, true, AlignmentType.CENTER, 1500),
        createWCCell('DESIGNATION', 1, true, AlignmentType.CENTER, 2500),
        createWCCell('NAME', 1, true, AlignmentType.CENTER, 2000),
        createWCCell('SIGNATURE', 1, true, AlignmentType.CENTER, 2000),
        createWCCell('DATE', 1, true, AlignmentType.CENTER, 1906),
      ], true),
      createRow([
        createWCCell('Prepared By', 1, true, AlignmentType.CENTER, 1500),
        createWCCell(data.signOffs.preparedBy.designation, 1, false, AlignmentType.CENTER, 2500),
        createWCCell(data.signOffs.preparedBy.name, 1, false, AlignmentType.CENTER, 2000),
        createWCCell('', 1, false, AlignmentType.CENTER, 2000),
        createWCCell(isProtocol ? (data.signOffs.preparedBy.dateProtocol || data.protocolDate) : (data.signOffs.preparedBy.dateReport || data.signOffs.preparedBy.date), 1, false, AlignmentType.CENTER, 1906),
      ]),
      createRow([
        createWCCell('Checked By', 1, true, AlignmentType.CENTER, 1500),
        createWCCell(data.signOffs.checkedBy.designation, 1, false, AlignmentType.CENTER, 2500),
        createWCCell(data.signOffs.checkedBy.name, 1, false, AlignmentType.CENTER, 2000),
        createWCCell('', 1, false, AlignmentType.CENTER, 2000),
        createWCCell(isProtocol ? (data.signOffs.checkedBy.dateProtocol || data.protocolDate) : (data.signOffs.checkedBy.dateReport || data.signOffs.checkedBy.date), 1, false, AlignmentType.CENTER, 1906),
      ]),
      createRow([
        createWCCell('Reviewed By', 1, true, AlignmentType.CENTER, 1500),
        createWCCell(data.signOffs.reviewedBy.designation, 1, false, AlignmentType.CENTER, 2500),
        createWCCell(data.signOffs.reviewedBy.name, 1, false, AlignmentType.CENTER, 2000),
        createWCCell('', 1, false, AlignmentType.CENTER, 2000),
        createWCCell(isProtocol ? (data.signOffs.reviewedBy.dateProtocol || data.protocolDate) : (data.signOffs.reviewedBy.dateReport || data.signOffs.reviewedBy.date), 1, false, AlignmentType.CENTER, 1906),
      ]),
      createRow([
        createWCCell('Authorized By', 1, true, AlignmentType.CENTER, 1500),
        createWCCell(data.signOffs.authorisedBy.designation, 1, false, AlignmentType.CENTER, 2500),
        createWCCell(data.signOffs.authorisedBy.name, 1, false, AlignmentType.CENTER, 2000),
        createWCCell('', 1, false, AlignmentType.CENTER, 2000),
        createWCCell(isProtocol ? (data.signOffs.authorisedBy.dateProtocol || data.protocolDate) : (data.signOffs.authorisedBy.dateReport || data.signOffs.authorisedBy.date), 1, false, AlignmentType.CENTER, 1906),
      ]),
    ];
    docElements.push(new Table({ width: { size: 9906, type: WidthType.DXA }, rows: wcSignRows }));
    docElements.push(new Paragraph({ children: [new PageBreak()] }));

  } else {
    // Normal / Blue Meta format
${oldMeta.split('\n').map(l => '  ' + l).join('\n')}
  }
`;

code = code.replace(oldMeta.trim(), newMeta.trim());
fs.writeFileSync('src/services/rsDocxGenerator.ts', code);
