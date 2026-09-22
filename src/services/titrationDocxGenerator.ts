import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';
import { TitrationAMVDocumentData } from '../types_titration';
import { DocumentType, ThemeFormat, DataMode, FooterSignOffData } from '../types';

export interface TitrationDocxOptions {
  docType: DocumentType;
  theme?: ThemeFormat;
  fontFamily?: string;
  fontSize?: number;
  dataMode?: DataMode;
  footerSignOffData?: FooterSignOffData;
}

export async function generateAndDownloadTitrationDocx(
  data: TitrationAMVDocumentData,
  options: TitrationDocxOptions
): Promise<void> {
  const { docType, theme = 'blue' } = options;
  const isProtocol = docType === 'protocol';
  const isBlue = theme === 'blue';

  const FONT_FAMILY = options.fontFamily || 'Times New Roman';
  const BASE_FONT_HALF_PT = (options.fontSize || 12) * 2;
  const TABLE_CELL_SIZE = Math.max(16, BASE_FONT_HALF_PT - 4); // ~10pt
  const SECTION_HEAD_SIZE = BASE_FONT_HALF_PT + 2; // ~13pt
  const SUBSECTION_HEAD_SIZE = BASE_FONT_HALF_PT; // ~12pt
  const BODY_SIZE = BASE_FONT_HALF_PT; // ~12pt

  const TOTAL_TABLE_WIDTH_DXA = 9906;

  // Blue / Navy styling matching PDF
  const headerBgColor = isBlue ? '1F4E79' : 'F3F4F6';
  const headerTextColor = isBlue ? 'FFFFFF' : '111827';
  const borderColor = isBlue ? 'B0C4DE' : 'D1D5DB';
  const altRowBgColor = isBlue ? 'F8FAFC' : 'F9FAFB';
  const metaLabelBgColor = isBlue ? 'F2F4F8' : 'F3F4F6';
  const navyTextColor = isBlue ? '1F4E79' : '111827';

  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    left: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    right: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
  };

  const createHeaderCell = (
    text: string,
    widthDxa: number,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER
  ) =>
    new TableCell({
      width: { size: widthDxa, type: WidthType.DXA },
      shading: { fill: headerBgColor },
      borders: thinBorder,
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 0, after: 0, line: 240 },
          children: [
            new TextRun({
              text: text || ' ',
              bold: true,
              size: TABLE_CELL_SIZE,
              font: FONT_FAMILY,
              color: headerTextColor,
            }),
          ],
        }),
      ],
    });

  const createCell = (
    text: string,
    widthDxa: number,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
    bold = false,
    shadingColor?: string
  ) =>
    new TableCell({
      width: { size: widthDxa, type: WidthType.DXA },
      shading: shadingColor ? { fill: shadingColor } : undefined,
      borders: thinBorder,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 0, after: 0, line: 240 },
          children: [
            new TextRun({
              text: text || ' ',
              bold,
              size: TABLE_CELL_SIZE,
              font: FONT_FAMILY,
              color: '111827',
            }),
          ],
        }),
      ],
    });

  const createRow = (cells: TableCell[], isHeader = false) =>
    new TableRow({
      tableHeader: isHeader,
      cantSplit: true,
      children: cells,
    });

  const createSectionHeader = (title: string, beforeSpace = 180, afterSpace = 80) =>
    new Paragraph({
      spacing: { before: beforeSpace, after: afterSpace },
      keepNext: true,
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: SECTION_HEAD_SIZE,
          font: FONT_FAMILY,
          color: navyTextColor,
        }),
      ],
    });

  const createSubSectionHeader = (title: string, beforeSpace = 120, afterSpace = 60) =>
    new Paragraph({
      spacing: { before: beforeSpace, after: afterSpace },
      keepNext: true,
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: SUBSECTION_HEAD_SIZE,
          font: FONT_FAMILY,
          color: navyTextColor,
        }),
      ],
    });

  const createBodyText = (text: string, beforeSpace = 40, afterSpace = 60) =>
    new Paragraph({
      spacing: { before: beforeSpace, after: afterSpace, line: 260 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: text || ' ',
          size: BODY_SIZE,
          font: FONT_FAMILY,
          color: '1F2937',
        }),
      ],
    });

  const docElements: (Paragraph | Table)[] = [];

  const singleDocNo = isProtocol ? data.protocolNo : data.reportNo;

  // ================= PAGE 1 =================
  // Company Header & Title
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 20, after: 30 },
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
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: data.companyAddress,
          size: 18,
          font: FONT_FAMILY,
          color: '4B5563',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: isProtocol
            ? 'ANALYTICAL METHOD VERIFICATION PROTOCOL (Assay by Titration)'
            : 'ANALYTICAL METHOD VERIFICATION REPORT (Assay by Titration)',
          bold: true,
          size: 24,
          font: FONT_FAMILY,
          color: navyTextColor,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: isProtocol
            ? '*** PROTOCOL — NOT AN EXECUTED REPORT ***'
            : '*** EXECUTED REPORT ***',
          bold: true,
          size: 18,
          font: FONT_FAMILY,
          color: isProtocol ? 'B91C1C' : '15803D',
        }),
      ],
    })
  );

  // Metadata Grid Table (Matching Reference PDF Table on Page 1)
  const metaColW = [2600, 7306];
  const metaRows: TableRow[] = [
    createRow([
      createCell(isProtocol ? 'Protocol No.' : 'Report No.', metaColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(singleDocNo, metaColW[1], AlignmentType.LEFT, true),
    ]),
    createRow([
      createCell('Product Name', metaColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.productName, metaColW[1], AlignmentType.LEFT, true),
    ]),
    createRow([
      createCell('Label Claim', metaColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.labelClaim, metaColW[1]),
    ]),
    createRow([
      createCell('Test Parameter', metaColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.testParameter, metaColW[1]),
    ]),
    createRow([
      createCell('Reference', metaColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.reference, metaColW[1]),
    ]),
    createRow([
      createCell(isProtocol ? 'Protocol Date' : 'Report Date', metaColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(isProtocol ? data.protocolDate : data.reportDate, metaColW[1]),
    ]),
    createRow([
      createCell('Format No.', metaColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.formatNo, metaColW[1]),
    ]),
    createRow([
      createCell('Supersedes', metaColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.supersedes || 'Nil', metaColW[1]),
    ]),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: metaRows,
    }),
    new Paragraph({ spacing: { before: 120, after: 100 } })
  );

  // Approval Block (4 Columns: Prepared By, Checked By, Reviewed By, Authorized By)
  const appColW = [2476, 2476, 2476, 2478];
  const createSignCell = (title: string, person: { name: string; designation: string; date: string }, w: number) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders: thinBorder,
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({ text: title, bold: true, size: TABLE_CELL_SIZE, font: FONT_FAMILY, color: navyTextColor }),
          ],
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: `Name: `, bold: true, size: 16, font: FONT_FAMILY }),
            new TextRun({ text: person.name, size: 16, font: FONT_FAMILY }),
          ],
        }),
        new Paragraph({
          spacing: { before: 20, after: 40 },
          children: [
            new TextRun({ text: `Designation: `, bold: true, size: 16, font: FONT_FAMILY }),
            new TextRun({ text: person.designation, size: 16, font: FONT_FAMILY }),
          ],
        }),
        new Paragraph({
          spacing: { before: 20, after: 40 },
          children: [
            new TextRun({ text: `Signature: `, bold: true, size: 16, font: FONT_FAMILY }),
            new TextRun({ text: '________________', size: 16, font: FONT_FAMILY }),
          ],
        }),
        new Paragraph({
          spacing: { before: 20, after: 0 },
          children: [
            new TextRun({ text: `Date: `, bold: true, size: 16, font: FONT_FAMILY }),
            new TextRun({ text: person.date, size: 16, font: FONT_FAMILY }),
          ],
        }),
      ],
    });

  const signTable = new Table({
    width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          createHeaderCell('Prepared By', appColW[0]),
          createHeaderCell('Checked By', appColW[1]),
          createHeaderCell('Reviewed By', appColW[2]),
          createHeaderCell('Authorized By', appColW[3]),
        ],
      }),
      new TableRow({
        children: [
          createSignCell('Prepared By', data.signOffs.preparedBy, appColW[0]),
          createSignCell('Checked By', data.signOffs.checkedBy, appColW[1]),
          createSignCell('Reviewed By', data.signOffs.reviewedBy, appColW[2]),
          createSignCell('Authorized By', data.signOffs.authorizedBy, appColW[3]),
        ],
      }),
    ],
  });

  docElements.push(signTable, new Paragraph({ spacing: { before: 140, after: 100 } }));

  // Table of Contents (Page 1 in PDF)
  docElements.push(
    createSectionHeader('TABLE OF CONTENTS', 100, 80)
  );

  const tocColW = [1200, 7206, 1500];
  const tocItems = [
    { sr: '1.0', title: 'Objective', page: 'Page 2' },
    { sr: '2.0', title: 'Scope', page: 'Page 2' },
    { sr: '3.0', title: 'Reference Documents & Verification Details', page: 'Page 2' },
    { sr: '4.0', title: 'Analytical Method Summary (4.1 Titrimetric Conditions, 4.2 Preparations, 4.3 Formula)', page: 'Page 2' },
    { sr: '4.4', title: 'Materials, Chemicals, Reference Standard & Equipment', page: 'Page 2' },
    { sr: '5.0', title: 'Verification Parameters and Acceptance Criteria', page: 'Page 3' },
    { sr: '6.0', title: 'System Suitability', page: 'Page 3' },
    { sr: '7.0', title: 'Linearity and Range (50 % to 150 % of nominal conc.)', page: 'Page 3' },
    { sr: '8.0', title: 'Precision (Repeatability, n = 6)', page: 'Page 5' },
    { sr: '9.0', title: 'Intermediate Precision (Analyst-to-Analyst)', page: 'Page 5' },
    { sr: '10.0', title: 'Accuracy / Recovery (75 %, 100 %, 125 % Levels)', page: 'Page 5' },
    { sr: '11.0', title: 'Overall Conclusion', page: 'Page 6' },
    { sr: '12.0', title: 'Review Checklist & Completion Record', page: 'Page 6' },
    { sr: '13.0', title: 'List of Abbreviations', page: 'Page 6' },
  ];

  const tocRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', tocColW[0]),
      createHeaderCell('Contents / Section Title', tocColW[1], AlignmentType.LEFT),
      createHeaderCell('Page No.', tocColW[2]),
    ], true),
    ...tocItems.map((item, idx) =>
      createRow([
        createCell(item.sr, tocColW[0], AlignmentType.CENTER),
        createCell(item.title, tocColW[1], AlignmentType.LEFT),
        createCell(item.page, tocColW[2], AlignmentType.CENTER),
      ], false)
    ),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: tocRows,
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ================= PAGE 2 =================
  // 1. OBJECTIVE
  docElements.push(
    createSectionHeader('1. OBJECTIVE', 60, 60),
    createBodyText(data.objective),
    createSectionHeader('2. SCOPE', 120, 60),
    createBodyText(data.scope),
    createSectionHeader('3. REFERENCE DOCUMENTS & VERIFICATION DETAILS', 120, 80)
  );

  const refColW = [3000, 6906];
  const refRows: TableRow[] = [
    createRow([
      createCell('Reference', refColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.referenceDetails.reference, refColW[1]),
    ]),
    createRow([
      createCell('(a) Type of Verification', refColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.referenceDetails.typeOfVerification, refColW[1]),
    ]),
    createRow([
      createCell('(b) Test to be Verified', refColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.referenceDetails.testToBeVerified, refColW[1]),
    ]),
    createRow([
      createCell('(c) Verification Team', refColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(
        `Analyst 1: ${data.referenceDetails.verificationTeam.analyst1}; Analyst 2: ${data.referenceDetails.verificationTeam.analyst2}; Supervisor: ${data.referenceDetails.verificationTeam.supervisor}`,
        refColW[1]
      ),
    ]),
    createRow([
      createCell('(d) Experimental Details', refColW[0], AlignmentType.LEFT, true, metaLabelBgColor),
      createCell(data.referenceDetails.experimentalDetails, refColW[1]),
    ]),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: refRows,
    }),
    new Paragraph({ spacing: { before: 100, after: 60 } })
  );

  // 4. ANALYTICAL METHOD SUMMARY
  const cond = data.methodSummary.titrimetricConditions;
  docElements.push(
    createSectionHeader('4. ANALYTICAL METHOD SUMMARY', 100, 60),
    createSubSectionHeader('4.1 Titrimetric Conditions', 60, 40),
    createBodyText(
      `The assay is performed by titrimetry. The titrimetric system is operated in Mode: ${cond.mode}, using Titrant: ${cond.titrant}, with Endpoint Detection: ${cond.endpointDetection}. The Sample taken for analysis is ${cond.sampleTakenDescription} The Blank consists of ${cond.blankDescription} Titration is carried out immediately until a ${cond.endpointColorTransition} is obtained.`
    ),
    createBodyText(`Note: ${cond.analyticalNote}`)
  );

  // 4.2 Preparation of Solutions
  docElements.push(createSubSectionHeader('4.2 Preparation of Solutions', 80, 60));

  const prepColW = [3000, 6906];
  const prepRows: TableRow[] = [
    createRow([
      createHeaderCell('Solution', prepColW[0], AlignmentType.LEFT),
      createHeaderCell('Preparation Procedure', prepColW[1], AlignmentType.LEFT),
    ], true),
    createRow([
      createCell('Blank', prepColW[0], AlignmentType.LEFT, true),
      createCell(data.methodSummary.solutionPreparation.blank, prepColW[1]),
    ]),
    createRow([
      createCell('Standard Solution', prepColW[0], AlignmentType.LEFT, true),
      createCell(data.methodSummary.solutionPreparation.standardSolution, prepColW[1]),
    ]),
    createRow([
      createCell('Sample Solution (Test Preparation)', prepColW[0], AlignmentType.LEFT, true),
      createCell(data.methodSummary.solutionPreparation.sampleSolution, prepColW[1]),
    ]),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: prepRows,
    }),
    new Paragraph({ spacing: { before: 80, after: 60 } })
  );

  // 4.3 Calculation Formula
  docElements.push(
    createSubSectionHeader('4.3 Calculation Formula', 80, 40),
    createBodyText(data.methodSummary.calculationFormula.generalFormula),
    createBodyText(
      'Where: ' +
        data.methodSummary.calculationFormula.definitions
          .map((d) => `${d.symbol} = ${d.meaning}`)
          .join(', ') +
        '.'
    )
  );

  // 4.4 Materials, Chemicals and Reference Standards
  docElements.push(createSubSectionHeader('4.4 Materials, Chemicals and Reference Standards', 80, 60));

  const matColW = [1000, 4706, 2200, 2000];
  const matRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', matColW[0]),
      createHeaderCell('Name of Material / Chemical / Standard', matColW[1], AlignmentType.LEFT),
      createHeaderCell('Type', matColW[2], AlignmentType.LEFT),
      createHeaderCell('Batch / Lot No.', matColW[3], AlignmentType.LEFT),
    ], true),
    ...data.methodSummary.materialsAndStandards.map((m) =>
      createRow([
        createCell(String(m.srNo), matColW[0], AlignmentType.CENTER),
        createCell(m.name, matColW[1], AlignmentType.LEFT, m.srNo === 1),
        createCell(m.type, matColW[2], AlignmentType.LEFT),
        createCell(isProtocol ? ' ' : m.lotNo, matColW[3], AlignmentType.LEFT),
      ])
    ),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: matRows,
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ================= PAGE 3 =================
  // 5. SUMMARY OF VERIFICATION PARAMETERS & ACCEPTANCE CRITERIA
  docElements.push(
    createSectionHeader('5. SUMMARY OF VERIFICATION PARAMETERS & ACCEPTANCE CRITERIA', 60, 60)
  );

  const paramColW = [800, 3206, 3900, 2000];
  const paramRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr.', paramColW[0]),
      createHeaderCell('Parameter', paramColW[1], AlignmentType.LEFT),
      createHeaderCell('Acceptance Criteria', paramColW[2], AlignmentType.LEFT),
      createHeaderCell('Verification Requirement', paramColW[3], AlignmentType.CENTER),
    ], true),
    ...data.verificationParameters.map((p) =>
      createRow([
        createCell(String(p.srNo), paramColW[0], AlignmentType.CENTER),
        createCell(p.parameter, paramColW[1], AlignmentType.LEFT, true),
        createCell(p.acceptanceCriteria, paramColW[2], AlignmentType.LEFT),
        createCell(isProtocol ? '—' : p.statusReport || 'Complies', paramColW[3], AlignmentType.CENTER),
      ])
    ),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: paramRows,
    }),
    new Paragraph({ spacing: { before: 120, after: 60 } })
  );

  // 6. SYSTEM SUITABILITY
  docElements.push(
    createSectionHeader('6. SYSTEM SUITABILITY', 80, 60),
    createBodyText(
      'Set of parameters and criteria thereof to ensure that the system is working properly. System suitability performed during entire verification of this method, by preparing five dilutions of the same concentration of sample and shows the results of system suitability by the application of statistical techniques i.e. Mean, Standard Deviation and Relative Standard Deviation (%).'
    ),
    createSubSectionHeader(`Table 1 — ${data.productName}`, 40, 40)
  );

  const sstColW = [1200, 4353, 4353];
  const sstRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', sstColW[0]),
      createHeaderCell('Working Standard Weight (mg)', sstColW[1]),
      createHeaderCell('Burette Reading (ml)', sstColW[2]),
    ], true),
    ...data.systemSuitability.rows.map((r) =>
      createRow([
        createCell(String(r.srNo), sstColW[0], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.weightMg), sstColW[1], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.buretteReadingMl), sstColW[2], AlignmentType.CENTER),
      ])
    ),
    createRow([
      createCell('Mean', sstColW[0] + sstColW[1], AlignmentType.RIGHT, true, metaLabelBgColor),
      createCell(isProtocol ? ' ' : String(data.systemSuitability.meanReadingMl), sstColW[2], AlignmentType.CENTER, true),
    ]),
    createRow([
      createCell('RSD (NMT 2.0 %)', sstColW[0] + sstColW[1], AlignmentType.RIGHT, true, metaLabelBgColor),
      createCell(isProtocol ? ' ' : `${data.systemSuitability.rsdReadingMl} %`, sstColW[2], AlignmentType.CENTER, true),
    ]),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: sstRows,
    }),
    new Paragraph({ spacing: { before: 120, after: 60 } })
  );

  // 7. LINEARITY AND RANGE
  docElements.push(
    createSectionHeader('7. LINEARITY AND RANGE', 80, 60),
    createSubSectionHeader('A. Linearity', 40, 40),
    createBodyText(data.linearityAndRange.linearity.explanatoryText1),
    createBodyText(data.linearityAndRange.linearity.explanatoryText2),
    createBodyText(
      '1) Prepare 5 or more standard solutions having concentrations that cover the range of detection (50 %; 75 %; 100 %; 125 % and 150 % of nominal concentration) of ' +
        data.productName +
        '.'
    ),
    ...data.linearityAndRange.linearity.levels.map((lvl) => createBodyText(lvl.preparationText, 10, 20)),
    createBodyText('2) Titrate each level in triplicate, record the burette reading and plot the mean burette reading against the concentration.', 20, 60),
    createSubSectionHeader(`Table 2 — ${data.productName}`, 40, 40)
  );

  // Table 2: 15 Rows (3 per level)
  const linColW = [1100, 1800, 2600, 2400, 2006];
  const linTableRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', linColW[0]),
      createHeaderCell('Level (%)', linColW[1]),
      createHeaderCell('Weight of WS taken (mg)', linColW[2]),
      createHeaderCell('Burette Reading (ml)', linColW[3]),
      createHeaderCell('Mean', linColW[4]),
    ], true),
  ];

  let repCounter = 1;
  data.linearityAndRange.linearity.levels.forEach((lvl) => {
    lvl.replicateReadings.forEach((reading, repIdx) => {
      const isFirst = repIdx === 0;
      linTableRows.push(
        createRow([
          createCell(String(repCounter++), linColW[0], AlignmentType.CENTER),
          createCell(isFirst ? `${lvl.levelPercent} %` : ' ', linColW[1], AlignmentType.CENTER, isFirst),
          createCell(isProtocol ? ' ' : lvl.weightTakenMg.toFixed(1), linColW[2], AlignmentType.CENTER),
          createCell(isProtocol ? ' ' : reading.toFixed(2), linColW[3], AlignmentType.CENTER),
          createCell(isFirst && !isProtocol ? lvl.meanReadingMl.toFixed(2) : ' ', linColW[4], AlignmentType.CENTER, isFirst),
        ])
      );
    });
  });

  linTableRows.push(
    createRow([
      createCell(
        isProtocol
          ? 'Correlation coefficient (r² > 0.995) = '
          : `Correlation coefficient (r² > 0.995) = ${data.linearityAndRange.linearity.rSquared}  (r = ${data.linearityAndRange.linearity.correlationCoefficientR})`,
        TOTAL_TABLE_WIDTH_DXA,
        AlignmentType.RIGHT,
        true,
        metaLabelBgColor
      ),
    ])
  );

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: linTableRows,
    }),
    new Paragraph({ spacing: { before: 100, after: 60 } })
  );

  // B. Range
  docElements.push(
    createSubSectionHeader('B. Range', 60, 40),
    createBodyText(data.linearityAndRange.range.explanatoryText),
    createBodyText(`1) Use the sample solutions of 75 % and 125 % of nominal concentration prepared in Linearity. ${data.productName}`),
    createSubSectionHeader(`Table 3 — ${data.productName}`, 40, 40)
  );

  const rangeColW = [1000, 2400, 1600, 2400, 2506];
  const rangeTableRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', rangeColW[0]),
      createHeaderCell('Sample ID', rangeColW[1], AlignmentType.LEFT),
      createHeaderCell('Level (%)', rangeColW[2]),
      createHeaderCell('Sample Burette Reading (ml)', rangeColW[3]),
      createHeaderCell('Statistical Evaluation', rangeColW[4]),
    ], true),
  ];

  data.linearityAndRange.range.rows.forEach((r, idx) => {
    let statText = ' ';
    if (!isProtocol) {
      if (idx === 0) statText = `Mean = ${data.linearityAndRange.range.stats75.mean}`;
      else if (idx === 1) statText = `SD = ${data.linearityAndRange.range.stats75.sd}`;
      else if (idx === 2) statText = `RSD (NMT 2.0 %) = ${data.linearityAndRange.range.stats75.rsd} %`;
      else if (idx === 3) statText = `Mean = ${data.linearityAndRange.range.stats125.mean}`;
      else if (idx === 4) statText = `SD = ${data.linearityAndRange.range.stats125.sd}`;
      else if (idx === 5) statText = `RSD (NMT 2.0 %) = ${data.linearityAndRange.range.stats125.rsd} %`;
    } else {
      if (idx === 0) statText = 'Mean =';
      else if (idx === 1) statText = 'SD =';
      else if (idx === 2) statText = 'RSD (NMT 2.0 %) =';
      else if (idx === 3) statText = 'Mean =';
      else if (idx === 4) statText = 'SD =';
      else if (idx === 5) statText = 'RSD (NMT 2.0 %) =';
    }

    rangeTableRows.push(
      createRow([
        createCell(String(r.srNo), rangeColW[0], AlignmentType.CENTER),
        createCell(r.sampleId, rangeColW[1], AlignmentType.LEFT),
        createCell(`${r.levelPercent} %`, rangeColW[2], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.buretteReadingMl), rangeColW[3], AlignmentType.CENTER),
        createCell(statText, rangeColW[4], AlignmentType.LEFT, idx === 2 || idx === 5),
      ])
    );
  });

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: rangeTableRows,
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ================= PAGE 5 =================
  // 8. PRECISION
  docElements.push(
    createSectionHeader('8. PRECISION', 60, 60),
    createBodyText(data.precision.explanatoryText),
    createSubSectionHeader(`Table 4 — ${data.productName}`, 40, 40)
  );

  const precColW = [1000, 2400, 2600, 2000, 1906];
  const precRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', precColW[0]),
      createHeaderCell('Sample ID', precColW[1], AlignmentType.LEFT),
      createHeaderCell('Amount of preparation used (mg)', precColW[2]),
      createHeaderCell('Burette Reading (ml)', precColW[3]),
      createHeaderCell('Content (% of LA)', precColW[4]),
    ], true),
    ...data.precision.rows.map((r) =>
      createRow([
        createCell(String(r.srNo), precColW[0], AlignmentType.CENTER),
        createCell(r.sampleId, precColW[1], AlignmentType.LEFT),
        createCell(isProtocol ? ' ' : String(r.amountUsedMg), precColW[2], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.buretteReadingMl), precColW[3], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.contentPercentLA), precColW[4], AlignmentType.CENTER),
      ])
    ),
    createRow([
      createCell('Mean', precColW[0] + precColW[1] + precColW[2] + precColW[3], AlignmentType.RIGHT, true, metaLabelBgColor),
      createCell(isProtocol ? ' ' : `${data.precision.meanContentPercent} %`, precColW[4], AlignmentType.CENTER, true),
    ]),
    createRow([
      createCell('RSD (NMT 2.0 %)', precColW[0] + precColW[1] + precColW[2] + precColW[3], AlignmentType.RIGHT, true, metaLabelBgColor),
      createCell(isProtocol ? ' ' : `${data.precision.rsdContentPercent} %`, precColW[4], AlignmentType.CENTER, true),
    ]),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: precRows,
    }),
    new Paragraph({ spacing: { before: 120, after: 60 } })
  );

  // 9. INTERMEDIATE PRECISION
  docElements.push(
    createSectionHeader('9. INTERMEDIATE PRECISION', 80, 60),
    createBodyText(data.intermediatePrecision.explanatoryText),
    createSubSectionHeader(`Table 5 — ${data.productName}`, 40, 40)
  );

  const ipColW = [906, 1500, 1500, 1500, 1500, 1500, 1500];
  const ipRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', ipColW[0]),
      createHeaderCell('Analyst : 1', ipColW[1] + ipColW[2] + ipColW[3]),
      createHeaderCell('Analyst : 2', ipColW[4] + ipColW[5] + ipColW[6]),
    ], true),
    createRow([
      createCell(' ', ipColW[0]),
      createHeaderCell('Amount of prepat. used (mg)', ipColW[1]),
      createHeaderCell('Sample Burette Reading (ml)', ipColW[2]),
      createHeaderCell('Content (% of LA)', ipColW[3]),
      createHeaderCell('Amount of prepat. used (mg)', ipColW[4]),
      createHeaderCell('Sample Burette Reading (ml)', ipColW[5]),
      createHeaderCell('Content (% of LA)', ipColW[6]),
    ], true),
    ...data.intermediatePrecision.rows.map((r) =>
      createRow([
        createCell(String(r.srNo), ipColW[0], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.analyst1.amountUsedMg), ipColW[1], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.analyst1.buretteReadingMl), ipColW[2], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.analyst1.contentPercentLA), ipColW[3], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.analyst2.amountUsedMg), ipColW[4], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.analyst2.buretteReadingMl), ipColW[5], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.analyst2.contentPercentLA), ipColW[6], AlignmentType.CENTER),
      ])
    ),
    createRow([
      createCell('Mean', ipColW[0] + ipColW[1] + ipColW[2], AlignmentType.RIGHT, true, metaLabelBgColor),
      createCell(isProtocol ? ' ' : `${data.intermediatePrecision.analyst1Stats.mean} %`, ipColW[3], AlignmentType.CENTER, true),
      createCell('Mean', ipColW[4] + ipColW[5], AlignmentType.RIGHT, true, metaLabelBgColor),
      createCell(isProtocol ? ' ' : `${data.intermediatePrecision.analyst2Stats.mean} %`, ipColW[6], AlignmentType.CENTER, true),
    ]),
    createRow([
      createCell('RSD (NMT 2.0 %)', ipColW[0] + ipColW[1] + ipColW[2], AlignmentType.RIGHT, true, metaLabelBgColor),
      createCell(isProtocol ? ' ' : `${data.intermediatePrecision.analyst1Stats.rsd} %`, ipColW[3], AlignmentType.CENTER, true),
      createCell('RSD (NMT 2.0 %)', ipColW[4] + ipColW[5], AlignmentType.RIGHT, true, metaLabelBgColor),
      createCell(isProtocol ? ' ' : `${data.intermediatePrecision.analyst2Stats.rsd} %`, ipColW[6], AlignmentType.CENTER, true),
    ]),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: ipRows,
    }),
    new Paragraph({ spacing: { before: 120, after: 60 } })
  );

  // 10. ACCURACY (RECOVERY)
  docElements.push(
    createSectionHeader('10. ACCURACY (RECOVERY)', 80, 60),
    createBodyText(data.accuracy.explanatoryText),
    createSubSectionHeader(`Table 6 — ${data.productName}`, 40, 40)
  );

  const accColW = [700, 1800, 1100, 1600, 1400, 1300, 1100, 906];
  const accRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', accColW[0]),
      createHeaderCell('Sample ID', accColW[1], AlignmentType.LEFT),
      createHeaderCell('Level (%)', accColW[2]),
      createHeaderCell('Amount spiked (mg)', accColW[3]),
      createHeaderCell('Burette Reading (ml)', accColW[4]),
      createHeaderCell('Amount recovered (mg)', accColW[5]),
      createHeaderCell('Recovery (%)', accColW[6]),
      createHeaderCell('Statistical Evaluation', accColW[7]),
    ], true),
  ];

  data.accuracy.rows.forEach((r, idx) => {
    let statText = ' ';
    const lvlStat = data.accuracy.levelStats.find((s) => s.levelPercent === r.levelPercent);
    if (!isProtocol && lvlStat) {
      if (idx === 0 || idx === 3 || idx === 6) statText = `Mean = ${lvlStat.meanRecovery} %`;
      else if (idx === 1 || idx === 4 || idx === 7) statText = `RSD = ${lvlStat.rsdRecovery} %`;
      else statText = '(NMT 2.0 %)';
    } else {
      if (idx === 0 || idx === 3 || idx === 6) statText = 'Mean =';
      else if (idx === 1 || idx === 4 || idx === 7) statText = 'RSD =';
      else statText = '(NMT 2.0 %)';
    }

    accRows.push(
      createRow([
        createCell(String(r.srNo), accColW[0], AlignmentType.CENTER),
        createCell(r.sampleId, accColW[1], AlignmentType.LEFT),
        createCell(`${r.levelPercent} %`, accColW[2], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.spikedMg), accColW[3], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.buretteReadingMl), accColW[4], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : String(r.recoveredMg), accColW[5], AlignmentType.CENTER),
        createCell(isProtocol ? ' ' : `${r.recoveryPercent} %`, accColW[6], AlignmentType.CENTER),
        createCell(statText, accColW[7], AlignmentType.LEFT),
      ])
    );
  });

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: accRows,
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ================= PAGE 6 =================
  // 11. OVERALL CONCLUSION
  docElements.push(
    createSectionHeader('11. OVERALL CONCLUSION', 60, 60),
    createBodyText(isProtocol ? data.overallConclusionProtocol : data.overallConclusionReport),
    ...(isProtocol
      ? [
          new Paragraph({
            spacing: { before: 80, after: 20 },
            children: [
              new TextRun({
                text: '____________________________________________________________________________________________',
                size: 16,
                font: FONT_FAMILY,
                color: '9CA3AF',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 20, after: 80 },
            children: [
              new TextRun({
                text: 'To be completed by the analyst after execution.',
                italics: true,
                size: 16,
                font: FONT_FAMILY,
                color: '6B7280',
              }),
            ],
          }),
        ]
      : [])
  );

  // 12. REVIEW CHECKLIST & COMPLETION RECORD
  docElements.push(createSectionHeader('12. REVIEW CHECKLIST & COMPLETION RECORD', 100, 60));

  const chkColW = [5000, 4906];
  const chkRows: TableRow[] = [
    createRow([
      createCell('Raw data & titration records reviewed', chkColW[0], AlignmentType.LEFT, true),
      createCell(isProtocol ? '[ ] Yes  [ ] No   Initials ________' : `[✓] Yes  [ ] No   Initials: ${data.reviewChecklist.rawRecordsInitials}`, chkColW[1]),
    ]),
    createRow([
      createCell('Calculation & statistical evaluation verified', chkColW[0], AlignmentType.LEFT, true),
      createCell(isProtocol ? '[ ] Yes  [ ] No   Initials ________' : `[✓] Yes  [ ] No   Initials: ${data.reviewChecklist.calcInitials}`, chkColW[1]),
    ]),
    createRow([
      createCell('Deviation / OOS raised', chkColW[0], AlignmentType.LEFT, true),
      createCell(isProtocol ? '[ ] None  [ ] Ref No: _________' : `[✓] None  [ ] Ref No: ${data.reviewChecklist.deviationRefNo}`, chkColW[1]),
    ]),
    createRow([
      createCell('Annexures attached', chkColW[0], AlignmentType.LEFT, true),
      createCell(isProtocol ? '_____ of _____ pages' : `${data.reviewChecklist.annexuresPages} of 04 pages`, chkColW[1]),
    ]),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: chkRows,
    }),
    new Paragraph({ spacing: { before: 120, after: 60 } })
  );

  // 13. LIST OF ABBREVIATIONS
  docElements.push(createSectionHeader('13. LIST OF ABBREVIATIONS', 80, 60));

  const abbColW = [2500, 7406];
  const abbRows: TableRow[] = [
    createRow([
      createHeaderCell('Abbreviation', abbColW[0]),
      createHeaderCell('Full Form / Expansion', abbColW[1], AlignmentType.LEFT),
    ], true),
    ...data.abbreviations.map((a) =>
      createRow([
        createCell(a.abbreviation, abbColW[0], AlignmentType.CENTER, true),
        createCell(a.fullForm, abbColW[1], AlignmentType.LEFT),
      ])
    ),
  ];

  docElements.push(
    new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: abbRows,
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 60 },
      children: [
        new TextRun({
          text: '--- END OF DOCUMENT ---',
          bold: true,
          size: 18,
          font: FONT_FAMILY,
          color: '4B5563',
        }),
      ],
    })
  );

  // Build Document with Running Header & Running Footer
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 80 },
                children: [
                  new TextRun({
                    text: `${data.companyName}  |  Assay AMV ${isProtocol ? 'Protocol' : 'Report'} – ${data.productName}  |  Doc No. ${singleDocNo}`,
                    size: 14,
                    font: FONT_FAMILY,
                    color: '6B7280',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 0 },
                children: [
                  new TextRun({
                    text: `Format No. ${data.formatNo}    |    Page `,
                    size: 16,
                    font: FONT_FAMILY,
                    color: '4B5563',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    font: FONT_FAMILY,
                    color: '4B5563',
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    font: FONT_FAMILY,
                    color: '4B5563',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    font: FONT_FAMILY,
                    color: '4B5563',
                  }),
                ],
              }),
            ],
          }),
        },
        children: docElements,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${singleDocNo.replace(/[/\\?%*:|"<>]/g, '_')}_${isProtocol ? 'Protocol' : 'Report'}.docx`;
  saveAs(blob, fileName);
}
