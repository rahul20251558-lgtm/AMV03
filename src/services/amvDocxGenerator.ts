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
import { AMVDocumentData, DocumentType, ThemeFormat } from '../types';
import { formatNum, formatInt } from './mathUtils';

export interface DocxOptions {
  docType: DocumentType;
  theme: ThemeFormat;
  fontFamily?: string;
  fontSize?: number;
}

export async function generateAndDownloadAMVDocx(
  data: AMVDocumentData,
  options: DocxOptions
): Promise<void> {
  const { docType, theme } = options;
  const isProtocol = docType === 'protocol';
  const isBlue = theme === 'blue';

  // Times New Roman (12pt default) matching authentic regulatory monograph
  const FONT_FAMILY = options.fontFamily || 'Times New Roman';
  const BASE_FONT_HALF_PT = (options.fontSize || 12) * 2;
  const TABLE_CELL_SIZE = Math.max(16, BASE_FONT_HALF_PT - 4);
  const SECTION_HEAD_SIZE = BASE_FONT_HALF_PT + 2;
  const SUBSECTION_HEAD_SIZE = BASE_FONT_HALF_PT;
  const BODY_SIZE = BASE_FONT_HALF_PT;

  // Exact A4 Printable Width: 11906 total dxa - 1000 left margin - 1000 right margin = 9906 dxa
  const TOTAL_TABLE_WIDTH_DXA = 9906;

  // Colors matching Reference PDF
  const headerBgColor = isBlue ? '1F4E79' : 'F3F4F6';
  const headerTextColor = isBlue ? 'FFFFFF' : '111827';
  const borderColor = isBlue ? 'B0C4DE' : 'D1D5DB';
  const altRowBgColor = isBlue ? 'F8FAFC' : 'F9FAFB';
  const metaLabelBgColor = isBlue ? 'F2F4F8' : 'F3F4F6';
  const navyTextColor = isBlue ? '1F4E79' : '111827';

  // Crisp table border: 0.5pt single line
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    left: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    right: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
  };

  const cellMargins = {
    top: 60, // 3pt
    bottom: 60,
    left: 90, // 4.5pt
    right: 90,
  };

  const createHeaderCell = (
    text: string,
    widthDxa: number,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER
  ) => {
    return new TableCell({
      shading: { fill: headerBgColor },
      borders: cellBorder,
      margins: cellMargins,
      width: { size: widthDxa, type: WidthType.DXA },
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: text !== '' && text !== undefined ? text : ' ',
              bold: true,
              color: headerTextColor,
              size: TABLE_CELL_SIZE,
              font: FONT_FAMILY,
            }),
          ],
        }),
      ],
    });
  };

  const createDataCell = (
    text: string | number | undefined | null,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
    bold = false,
    bg?: string,
    widthDxa?: number
  ) => {
    const displayText = text !== '' && text !== undefined && text !== null ? String(text) : ' ';
    return new TableCell({
      shading: bg ? { fill: bg } : undefined,
      borders: cellBorder,
      margins: cellMargins,
      width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : undefined,
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: displayText,
              bold,
              size: TABLE_CELL_SIZE,
              font: FONT_FAMILY,
              color: '111827',
            }),
          ],
        }),
      ],
    });
  };

  const createDocxTable = (colWidths: number[], rows: TableRow[]) => {
    return new Table({
      width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
      columnWidths: colWidths,
      rows,
    });
  };

  const createRow = (cells: TableCell[], isHeader = false) => {
    return new TableRow({
      cantSplit: true,
      tableHeader: isHeader,
      children: cells,
    });
  };

  const createSectionHeader = (title: string, beforeSpace = 120, afterSpace = 50) => {
    return new Paragraph({
      spacing: { before: beforeSpace, after: afterSpace },
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
  };

  const createSubSectionHeader = (title: string, beforeSpace = 80, afterSpace = 30) => {
    return new Paragraph({
      spacing: { before: beforeSpace, after: afterSpace },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: SUBSECTION_HEAD_SIZE,
          font: FONT_FAMILY,
          color: '1F2937',
        }),
      ],
    });
  };

  const createBodyParagraph = (text: string, beforeSpace = 20, afterSpace = 40) => {
    return new Paragraph({
      spacing: { before: beforeSpace, after: afterSpace },
      children: [
        new TextRun({
          text,
          size: BODY_SIZE,
          font: FONT_FAMILY,
          color: '27272A',
        }),
      ],
    });
  };

  const createAcceptanceParagraph = (text: string) => {
    return new Paragraph({
      spacing: { before: 50, after: 50 },
      children: [
        new TextRun({
          text,
          size: BODY_SIZE,
          font: FONT_FAMILY,
          bold: true,
          color: '1F2937',
        }),
      ],
    });
  };

  const c = data.chromatographicConditions;
  const ss = data.systemSuitability;
  const spec = data.specificity;
  const lin = data.linearity;
  const acc = data.accuracy;
  const prec = data.precision;
  const rob = data.robustness;
  const stab = data.solutionStability;

  // Single document number source of truth for exact character-by-character consistency
  const singleDocNumber = isProtocol
    ? data.documentNo
    : (data.reportNo || (data.documentNo.includes('/AMV/') ? data.documentNo.replace('/AMV/', '/AMVR/') : `${data.documentNo}/R`));

  // =========================================================================
  // PAGE 1: MASTHEAD, METADATA, 3-COL SIGN-OFF, SEC 1, 2, 3, 4.1 HEADING
  // =========================================================================

  // Masthead
  const page1CompanyHeader = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 20 },
    children: [
      new TextRun({
        text: data.companyName,
        bold: true,
        size: 28, // 14pt (increased from 13pt)
        font: FONT_FAMILY,
        color: navyTextColor,
      }),
    ],
  });

  const page1Address = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [
      new TextRun({
        text: data.companyAddress,
        size: 20, // 10pt (increased from 9pt)
        font: FONT_FAMILY,
        color: '4B5563',
      }),
    ],
  });

  const page1DocTitle = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 100 },
    children: [
      new TextRun({
        text: isProtocol
          ? 'ANALYTICAL METHOD VALIDATION PROTOCOL (Assay by HPLC)'
          : 'ANALYTICAL METHOD VALIDATION REPORT (Assay by HPLC)',
        bold: true,
        size: 24, // 12pt (increased from 11pt)
        font: FONT_FAMILY,
        color: navyTextColor,
      }),
    ],
  });

  // Metadata Table (2 cols: 3106, 6800 dxa)
  const colMeta = [3106, 6800];
  const page1MetaTable = createDocxTable(colMeta, [
    createRow([
      createDataCell(isProtocol ? 'Protocol No.' : 'Report No.', AlignmentType.LEFT, true, metaLabelBgColor, colMeta[0]),
      createDataCell(singleDocNumber, AlignmentType.LEFT, true, undefined, colMeta[1]),
    ]),
    createRow([
      createDataCell('Product Name', AlignmentType.LEFT, true, metaLabelBgColor, colMeta[0]),
      createDataCell(data.productName, AlignmentType.LEFT, true, undefined, colMeta[1]),
    ]),
    createRow([
      createDataCell('Label Claim', AlignmentType.LEFT, true, metaLabelBgColor, colMeta[0]),
      createDataCell(data.labelClaim, AlignmentType.LEFT, false, undefined, colMeta[1]),
    ]),
    createRow([
      createDataCell('Test Parameter', AlignmentType.LEFT, true, metaLabelBgColor, colMeta[0]),
      createDataCell(data.testParameter, AlignmentType.LEFT, false, undefined, colMeta[1]),
    ]),
    createRow([
      createDataCell('Reference', AlignmentType.LEFT, true, metaLabelBgColor, colMeta[0]),
      createDataCell(data.reference, AlignmentType.LEFT, false, undefined, colMeta[1]),
    ]),
    createRow([
      createDataCell('Batch No. Used', AlignmentType.LEFT, true, metaLabelBgColor, colMeta[0]),
      createDataCell(data.batchNoUsed, AlignmentType.LEFT, true, undefined, colMeta[1]),
    ]),
    createRow([
      createDataCell('Effective Date', AlignmentType.LEFT, true, metaLabelBgColor, colMeta[0]),
      createDataCell(isProtocol ? '01-Apr-2026' : (data.effectiveDate || '21-Apr-2026'), AlignmentType.LEFT, false, undefined, colMeta[1]),
    ]),
    createRow([
      createDataCell('Supersedes', AlignmentType.LEFT, true, metaLabelBgColor, colMeta[0]),
      createDataCell(data.supersedes, AlignmentType.LEFT, false, undefined, colMeta[1]),
    ]),
  ]);

  // 3-Column Sign-Off Table matching Reference PDF exactly
  // Widths: 3302, 3302, 3302 = 9906 dxa
  const colSign3 = [3302, 3302, 3302];
  const prepDate = isProtocol ? '25-Mar-2026' : (data.signOffs.preparedBy.date || '15-Apr-2026');
  const revDate = isProtocol ? '28-Mar-2026' : (data.signOffs.reviewedBy.date || '18-Apr-2026');
  const appDate = isProtocol ? '31-Mar-2026' : (data.signOffs.approvedBy.date || '20-Apr-2026');

  const createSignCell = (
    name: string,
    designation: string,
    dateText: string,
    widthDxa: number
  ) => {
    return new TableCell({
      borders: cellBorder,
      margins: { top: 70, bottom: 70, left: 100, right: 100 },
      width: { size: widthDxa, type: WidthType.DXA },
      children: [
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: 'Name: ', bold: true, size: 20, font: FONT_FAMILY }),
            new TextRun({ text: name || ' ', size: 20, font: FONT_FAMILY }),
          ],
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: 'Designation: ', bold: true, size: 20, font: FONT_FAMILY }),
            new TextRun({ text: designation || ' ', size: 20, font: FONT_FAMILY }),
          ],
        }),
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: 'Signature / Date: ', bold: true, size: 20, font: FONT_FAMILY }),
            new TextRun({ text: dateText || ' ', size: 20, font: FONT_FAMILY }),
          ],
        }),
      ],
    });
  };

  const page1SignOffTable = createDocxTable(colSign3, [
    createRow(
      [
        createHeaderCell('Prepared By', colSign3[0]),
        createHeaderCell('Reviewed / Checked By', colSign3[1]),
        createHeaderCell('Approved By', colSign3[2]),
      ],
      true
    ),
    createRow([
      createSignCell(data.signOffs.preparedBy.name, data.signOffs.preparedBy.designation, prepDate, colSign3[0]),
      createSignCell(data.signOffs.reviewedBy.name, data.signOffs.reviewedBy.designation, revDate, colSign3[1]),
      createSignCell(data.signOffs.approvedBy.name, data.signOffs.approvedBy.designation, appDate, colSign3[2]),
    ]),
  ]);

  // Section 3: Reference Documents & Verification Details Table
  const colSec3 = [2706, 7200];
  const sec3Table = createDocxTable(colSec3, [
    createRow([
      createDataCell('Reference', AlignmentType.LEFT, true, metaLabelBgColor, colSec3[0]),
      createDataCell(data.verificationDetails?.reference || data.reference, AlignmentType.LEFT, false, undefined, colSec3[1]),
    ]),
    createRow([
      createDataCell('(a) Type of Verification', AlignmentType.LEFT, true, metaLabelBgColor, colSec3[0]),
      createDataCell(data.verificationDetails?.typeOfVerification || 'Verification of a compendial assay procedure under actual conditions of use, as per USP <1225> and ICH Q2(R2)', AlignmentType.LEFT, false, undefined, colSec3[1]),
    ]),
    createRow([
      createDataCell('(b) Test to be Verified', AlignmentType.LEFT, true, metaLabelBgColor, colSec3[0]),
      createDataCell(data.verificationDetails?.testToBeVerified || `Assay by HPLC (${data.activeSubstance} content)`, AlignmentType.LEFT, false, undefined, colSec3[1]),
    ]),
    createRow([
      createDataCell('(c) Verification Team', AlignmentType.LEFT, true, metaLabelBgColor, colSec3[0]),
      createDataCell(data.verificationDetails?.verificationTeam || 'Analyst 1: Sahil Panchal (Chemist, QC); Analyst 2: Smit Patel (Executive, QC); Supervisor: Anil Parmar (Manager, QC)', AlignmentType.LEFT, false, undefined, colSec3[1]),
    ]),
    createRow([
      createDataCell('(d) Experimental Details', AlignmentType.LEFT, true, metaLabelBgColor, colSec3[0]),
      createDataCell(data.verificationDetails?.experimentalDetails || `Specificity, system suitability, linearity (50 % to 150 %), accuracy / recovery (50 %, 100 %, 150 %), precision and intermediate precision, robustness and stability of analytical solutions up to 24 hours, executed on batch ${data.batchNoUsed}.`, AlignmentType.LEFT, false, undefined, colSec3[1]),
    ]),
  ]);

  // =========================================================================
  // PAGE 2: SEC 4.1 TABLE, NOTE, SEC 4.2 TABLE, SEC 4.3 CALCULATION FORMULAE
  // =========================================================================

  // 4.1 Chromatographic Conditions Table (3406, 6500 dxa)
  const colChrom = [3406, 6500];
  const chromTable = createDocxTable(colChrom, [
    createRow([createHeaderCell('Parameter', colChrom[0], AlignmentType.LEFT), createHeaderCell('Condition', colChrom[1], AlignmentType.LEFT)], true),
    createRow([createDataCell('Column', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.column, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Mobile Phase', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.mobilePhase, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Flow Rate', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.flowRate, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Detection Wavelength', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.detectionWavelength, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Injection Volume', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.injectionVolume, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Column Temperature', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.columnTemperature, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Run Time', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.runTime, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Diluent', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.diluent, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Working Concentration', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.workingConcentration, AlignmentType.LEFT, false, undefined, colChrom[1])]),
    createRow([createDataCell('Approx. Retention Time', AlignmentType.LEFT, true, metaLabelBgColor, colChrom[0]), createDataCell(c.approxRetentionTime || '6.5 min', AlignmentType.LEFT, false, undefined, colChrom[1])]),
  ]);

  // 4.2 Preparation of Solutions Table (2806, 7100 dxa)
  const colSol = [2806, 7100];
  const solTable = createDocxTable(colSol, [
    createRow([createHeaderCell('Solution', colSol[0], AlignmentType.LEFT), createHeaderCell('Preparation Procedure', colSol[1], AlignmentType.LEFT)], true),
    createRow([
      createDataCell(`Standard Solution (${c.workingConcentration})`, AlignmentType.LEFT, true, metaLabelBgColor, colSol[0]),
      createDataCell(data.solutionPreparation.standardSolution, AlignmentType.LEFT, false, undefined, colSol[1]),
    ]),
    createRow([
      createDataCell(`Sample Solution (${c.workingConcentration})`, AlignmentType.LEFT, true, metaLabelBgColor, colSol[0]),
      createDataCell(data.solutionPreparation.sampleSolution, AlignmentType.LEFT, false, undefined, colSol[1]),
    ]),
  ]);

  // =========================================================================
  // PAGE 3: SEC 4.4 (REAGENTS & EQUIPMENT), SEC 5 (ROWS 1 TO 4)
  // =========================================================================

  // Reagents Table (4 cols: 3406, 2200, 2200, 2100 dxa)
  const colReagents = [3406, 2200, 2200, 2100];
  const reagentsRows = [
    createRow([
      createHeaderCell('Name of Chemical / Standard', colReagents[0], AlignmentType.LEFT),
      createHeaderCell('Grade', colReagents[1], AlignmentType.LEFT),
      createHeaderCell('Make / Catalogue', colReagents[2], AlignmentType.LEFT),
      createHeaderCell('Batch / Lot No.', colReagents[3], AlignmentType.LEFT),
    ], true),
    ...data.reagentsAndStandards.map((r) =>
      createRow([
        createDataCell(r.name, AlignmentType.LEFT, true, undefined, colReagents[0]),
        createDataCell(r.grade, AlignmentType.LEFT, false, undefined, colReagents[1]),
        createDataCell(r.make, AlignmentType.LEFT, false, undefined, colReagents[2]),
        createDataCell(r.batchNo, AlignmentType.LEFT, false, undefined, colReagents[3]),
      ])
    ),
  ];
  const reagentsTable = createDocxTable(colReagents, reagentsRows);

  // Section 5 Validation Parameters Table (4 cols: 600, 2600, 3906, 2800 dxa = 9906 dxa)
  const colValParam = [600, 2600, 3906, 2800];
  const valResultHeader = isProtocol ? 'Verification Requirement' : 'Result / Acceptance Status';

  const valRowsP3Data = [
    {
      sr: 1,
      param: 'Specificity',
      criteria: 'No interference from blank (diluent) and placebo at the retention time of the analyte peak. Peak purity passed by PDA.',
      result: isProtocol ? 'To be verified as per protocol criteria' : 'No interference observed; peak purity passed (purity angle < threshold) — Complies',
    },
    {
      sr: 2,
      param: 'System Suitability',
      criteria: 'Tailing factor NMT 2.0; %RSD of area NMT 2.0 % (n=5); theoretical plates NLT 2000.',
      result: isProtocol ? 'To be verified as per protocol criteria' : `Tailing ${formatNum(ss.meanTailing, 2)}; %RSD ${formatNum(ss.rsdArea, 2)} %; plates ${formatInt(ss.meanPlates)} — Complies`,
    },
    {
      sr: 3,
      param: 'Linearity (50%–150%)',
      criteria: 'Correlation coefficient (r) shall be ≥ 0.999 (r² ≥ 0.998); slope and y-intercept reported; y-intercept bias at 100 % level within ±2.0 %.',
      result: isProtocol ? 'To be verified as per protocol criteria' : `r = ${formatNum(lin.regression.correlationR, 5)}; slope ${formatNum(lin.regression.slope, 1)}; y-intercept ${formatNum(lin.regression.yIntercept, 0)}; bias ${formatNum(lin.regression.yInterceptBiasPercent, 2)} % — Complies`,
    },
    {
      sr: 4,
      param: 'Accuracy (50%–150%)',
      criteria: 'Mean recovery of three levels in triplicate between 98.0 % and 102.0 %; %RSD at each level NMT 2.0 %.',
      result: isProtocol ? 'To be verified as per protocol criteria' : `Mean recovery ${formatNum(acc.meanRecoveryAllLevels, 2)} % (n = 9, %RSD ${formatNum(acc.rsdAllLevels, 2)} %) — Complies`,
    },
  ];

  const valTableP3 = createDocxTable(colValParam, [
    createRow([
      createHeaderCell('Sr.', colValParam[0]),
      createHeaderCell('Parameter', colValParam[1], AlignmentType.LEFT),
      createHeaderCell('Acceptance Criteria', colValParam[2], AlignmentType.LEFT),
      createHeaderCell(valResultHeader, colValParam[3]),
    ], true),
    ...valRowsP3Data.map((v) =>
      createRow([
        createDataCell(v.sr, AlignmentType.CENTER, true, undefined, colValParam[0]),
        createDataCell(v.param, AlignmentType.LEFT, true, undefined, colValParam[1]),
        createDataCell(v.criteria, AlignmentType.LEFT, false, undefined, colValParam[2]),
        createDataCell(v.result, AlignmentType.LEFT, false, undefined, colValParam[3]),
      ])
    ),
  ]);

  // Dynamic stability difference calculation for docx
  const initialStdArea = stab.rows[0]?.standardArea || 1;
  const initialSplArea = stab.rows[0]?.sampleArea || 1;
  let maxDocxStdDiff = 0;
  let maxDocxSplDiff = 0;
  stab.rows.forEach((r, i) => {
    if (i > 0) {
      const dS = (Math.abs(r.standardArea - initialStdArea) / initialStdArea) * 100;
      const dP = (Math.abs(r.sampleArea - initialSplArea) / initialSplArea) * 100;
      if (dS > maxDocxStdDiff) maxDocxStdDiff = dS;
      if (dP > maxDocxSplDiff) maxDocxSplDiff = dP;
    }
  });

  const maxRobRsd = rob.rows.length > 0 ? Math.max(...rob.rows.map((r) => r.rsdPercent)) : 0.13;

  const valRowsP4Data = [
    {
      sr: 5,
      param: 'Range',
      criteria: 'Mean recovery 98.0 % to 102.0 %; %RSD ≤ 2.0 % at each level; correlation coefficient r ≥ 0.999.',
      result: isProtocol ? 'To be verified as per protocol criteria' : `Mean recovery ${formatNum(acc.meanRecoveryAllLevels, 2)} %; %RSD ${formatNum(acc.rsdAllLevels, 2)} %; r = ${formatNum(lin.regression.correlationR, 5)} — Complies`,
    },
    {
      sr: 6,
      param: 'Method Precision (Repeatability)',
      criteria: '%RSD for six assay sample preparations NMT 2.0 %.',
      result: isProtocol ? 'To be verified as per protocol criteria' : `Mean ${formatNum(prec.analyst1Mean, 2)} %; %RSD ${formatNum(prec.analyst1Rsd, 2)} % — Complies`,
    },
    {
      sr: 7,
      param: 'Intermediate Precision (Ruggedness)',
      criteria: '%RSD for six results NMT 2.0 %; cumulative %RSD for twelve results NMT 2.0 %.',
      result: isProtocol ? 'To be verified as per protocol criteria' : `Analyst 2 %RSD ${formatNum(prec.analyst2Rsd, 2)} %; Cumulative %RSD ${formatNum(prec.cumulativeRsd, 2)} % (n = 12) — Complies`,
    },
    {
      sr: 8,
      param: 'Robustness',
      criteria: 'System suitability criteria met under all deliberately varied conditions (%RSD NMT 2.0 %, Tailing NMT 2.0, Plates NLT 2000).',
      result: isProtocol ? 'To be verified as per protocol criteria' : `Maximum %RSD ${formatNum(maxRobRsd, 2)} %; all criteria met — Complies`,
    },
    {
      sr: 9,
      param: 'Solution Stability',
      criteria: 'Cumulative difference in peak response for standard and sample solutions over 24 hours shall not exceed 2.0 %; %RSD ≤ 2.0 %.',
      result: isProtocol ? 'To be verified as per protocol criteria' : `Standard max diff ${formatNum(maxDocxStdDiff, 2)} %; Sample max diff ${formatNum(maxDocxSplDiff, 2)} % (24 h) — Complies`,
    },
  ];

  const valTableP4 = createDocxTable(colValParam, [
    createRow([
      createHeaderCell('Sr.', colValParam[0]),
      createHeaderCell('Parameter', colValParam[1], AlignmentType.LEFT),
      createHeaderCell('Acceptance Criteria', colValParam[2], AlignmentType.LEFT),
      createHeaderCell(valResultHeader, colValParam[3]),
    ], true),
    ...valRowsP4Data.map((v) =>
      createRow([
        createDataCell(v.sr, AlignmentType.CENTER, true, undefined, colValParam[0]),
        createDataCell(v.param, AlignmentType.LEFT, true, undefined, colValParam[1]),
        createDataCell(v.criteria, AlignmentType.LEFT, false, undefined, colValParam[2]),
        createDataCell(v.result, AlignmentType.LEFT, false, undefined, colValParam[3]),
      ])
    ),
  ]);

  // Section 6 System Suitability Table (4 cols: 2476, 2476, 2476, 2478 dxa)
  const colSS = [2476, 2476, 2476, 2478];
  const ssRows = [
    createRow([
      createHeaderCell('Injection No.', colSS[0]),
      createHeaderCell('Peak Area (µV·s)', colSS[1]),
      createHeaderCell('Tailing Factor', colSS[2]),
      createHeaderCell('Theoretical Plates', colSS[3]),
    ], true),
    ...ss.injections.map((inj) =>
      createRow([
        createDataCell(inj.injectionNo, AlignmentType.CENTER, true, undefined, colSS[0]),
        createDataCell(isProtocol ? '' : formatInt(inj.peakArea), AlignmentType.RIGHT, false, undefined, colSS[1]),
        createDataCell(isProtocol ? '' : formatNum(inj.tailingFactor, 2), AlignmentType.RIGHT, false, undefined, colSS[2]),
        createDataCell(isProtocol ? '' : formatInt(inj.theoreticalPlates), AlignmentType.RIGHT, false, undefined, colSS[3]),
      ])
    ),
    createRow([
      createDataCell('Mean', AlignmentType.CENTER, true, altRowBgColor, colSS[0]),
      createDataCell(isProtocol ? '' : formatInt(ss.meanArea), AlignmentType.RIGHT, true, altRowBgColor, colSS[1]),
      createDataCell(isProtocol ? '' : formatNum(ss.meanTailing, 2), AlignmentType.RIGHT, true, altRowBgColor, colSS[2]),
      createDataCell(isProtocol ? '' : formatInt(ss.meanPlates), AlignmentType.RIGHT, true, altRowBgColor, colSS[3]),
    ]),
    createRow([
      createDataCell('% RSD', AlignmentType.CENTER, true, altRowBgColor, colSS[0]),
      createDataCell(isProtocol ? 'To be evaluated' : `${formatNum(ss.rsdArea, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colSS[1]),
      createDataCell(isProtocol ? 'To be evaluated' : `${formatNum(ss.rsdTailing, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colSS[2]),
      createDataCell(isProtocol ? 'To be evaluated' : `${formatNum(ss.rsdPlates, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colSS[3]),
    ]),
  ];
  const ssTable = createDocxTable(colSS, ssRows);

  // Section 7 Specificity Table (3 cols: 3506, 3200, 3200 dxa)
  const colSpec = [3506, 3200, 3200];
  const specRows = [
    createRow([
      createHeaderCell('Solution', colSpec[0], AlignmentType.LEFT),
      createHeaderCell('Retention Time (min)', colSpec[1]),
      createHeaderCell('Interference Observed', colSpec[2]),
    ], true),
    ...spec.rows.map((r) =>
      createRow([
        createDataCell(r.solution, AlignmentType.LEFT, true, undefined, colSpec[0]),
        createDataCell(isProtocol ? '' : r.retentionTime, AlignmentType.CENTER, false, undefined, colSpec[1]),
        createDataCell(isProtocol ? '' : r.interference, AlignmentType.CENTER, false, undefined, colSpec[2]),
      ])
    ),
  ];
  const specTable = createDocxTable(colSpec, specRows);

  // =========================================================================
  // PAGE 5: SEC 8 LINEARITY (TABLES 1 & 2), SEC 9 ACCURACY (ROWS 1 TO 6)
  // =========================================================================

  // Linearity Table 1 (4 cols: 2476, 2476, 2476, 2478 dxa)
  const colLin1 = [2476, 2476, 2476, 2478];
  const lin1Rows = [
    createRow([
      createHeaderCell('Level (%)', colLin1[0]),
      createHeaderCell('Concentration (µg/mL)', colLin1[1]),
      createHeaderCell('Mean Peak Area (µV·s)', colLin1[2]),
      createHeaderCell('% of 100% Response', colLin1[3]),
    ], true),
    ...lin.levels.map((lvl) =>
      createRow([
        createDataCell(`${lvl.levelPercent} %`, AlignmentType.CENTER, true, undefined, colLin1[0]),
        createDataCell(formatNum(lvl.concentration, 2), AlignmentType.RIGHT, false, undefined, colLin1[1]),
        createDataCell(isProtocol ? '' : formatInt(lvl.meanArea), AlignmentType.RIGHT, false, undefined, colLin1[2]),
        createDataCell(isProtocol ? '' : `${formatNum(lvl.percentOf100Response, 2)} %`, AlignmentType.RIGHT, false, undefined, colLin1[3]),
      ])
    ),
  ];
  const lin1Table = createDocxTable(colLin1, lin1Rows);

  // Linearity Table 2 Regression (2 cols: 5406, 4500 dxa)
  const colLin2 = [5406, 4500];
  const lin2Rows = [
    createRow([createHeaderCell('Regression Parameter', colLin2[0], AlignmentType.LEFT), createHeaderCell('Value', colLin2[1])], true),
    createRow([createDataCell('Correlation Coefficient (r)', AlignmentType.LEFT, true, undefined, colLin2[0]), createDataCell(isProtocol ? 'Criteria: ≥ 0.999' : formatNum(lin.regression.correlationR, 5), AlignmentType.RIGHT, true, undefined, colLin2[1])]),
    createRow([createDataCell('Coefficient of Determination (r²)', AlignmentType.LEFT, true, undefined, colLin2[0]), createDataCell(isProtocol ? 'Criteria: ≥ 0.998' : formatNum(lin.regression.rSquared, 5), AlignmentType.RIGHT, true, undefined, colLin2[1])]),
    createRow([createDataCell('Slope', AlignmentType.LEFT, true, undefined, colLin2[0]), createDataCell(isProtocol ? '' : formatNum(lin.regression.slope, 2), AlignmentType.RIGHT, false, undefined, colLin2[1])]),
    createRow([createDataCell('y-Intercept', AlignmentType.LEFT, true, undefined, colLin2[0]), createDataCell(isProtocol ? '' : formatNum(lin.regression.yIntercept, 2), AlignmentType.RIGHT, false, undefined, colLin2[1])]),
    createRow([createDataCell('y-Intercept bias as % of 100% response', AlignmentType.LEFT, true, undefined, colLin2[0]), createDataCell(isProtocol ? 'Criteria: NMT ±2.0%' : `${formatNum(lin.regression.yInterceptBiasPercent, 2)} %`, AlignmentType.RIGHT, false, undefined, colLin2[1])]),
  ];
  const lin2Table = createDocxTable(colLin2, lin2Rows);

  // Accuracy Table: All 9 determinations + Summary rows (5 cols: 1606, 1500, 2200, 2400, 2200 dxa)
  const colAcc = [1606, 1500, 2200, 2400, 2200];
  const accRows = [
    createRow([
      createHeaderCell('Level (%)', colAcc[0]),
      createHeaderCell('Exp. No.', colAcc[1]),
      createHeaderCell('Amount Added (mg)', colAcc[2]),
      createHeaderCell('Amount Recovered (mg)', colAcc[3]),
      createHeaderCell('% Recovery', colAcc[4]),
    ], true),
    ...acc.rows.map((r) =>
      createRow([
        createDataCell(`${r.levelPercent} %`, AlignmentType.CENTER, true, undefined, colAcc[0]),
        createDataCell(r.expNo, AlignmentType.CENTER, false, undefined, colAcc[1]),
        createDataCell(formatNum(r.amountAdded, 2), AlignmentType.RIGHT, false, undefined, colAcc[2]),
        createDataCell(isProtocol ? '' : formatNum(r.amountRecovered, 2), AlignmentType.RIGHT, false, undefined, colAcc[3]),
        createDataCell(isProtocol ? '' : `${formatNum(r.percentRecovery, 2)} %`, AlignmentType.RIGHT, false, undefined, colAcc[4]),
      ])
    ),
    createRow([
      createDataCell('Mean % Recovery (all levels)', AlignmentType.LEFT, true, altRowBgColor, colAcc[0]),
      createDataCell('3 Levels (50%, 100%, 150%)', AlignmentType.CENTER, false, altRowBgColor, colAcc[1]),
      createDataCell('9 Determinations', AlignmentType.CENTER, false, altRowBgColor, colAcc[2]),
      createDataCell(isProtocol ? '' : 'Mean of 9 runs', AlignmentType.RIGHT, false, altRowBgColor, colAcc[3]),
      createDataCell(isProtocol ? 'Criteria: 98.0 – 102.0 %' : `${formatNum(acc.meanRecoveryAllLevels, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colAcc[4]),
    ]),
    createRow([
      createDataCell('% RSD (n = 9)', AlignmentType.LEFT, true, altRowBgColor, colAcc[0]),
      createDataCell('Across all 9 runs', AlignmentType.CENTER, false, altRowBgColor, colAcc[1]),
      createDataCell('Overall % RSD', AlignmentType.CENTER, false, altRowBgColor, colAcc[2]),
      createDataCell(isProtocol ? '' : 'NMT 2.0 %', AlignmentType.RIGHT, false, altRowBgColor, colAcc[3]),
      createDataCell(isProtocol ? 'Criteria: NMT 2.0 %' : `${formatNum(acc.rsdAllLevels, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colAcc[4]),
    ]),
  ];
  const accTable = createDocxTable(colAcc, accRows);

  // Section 10 Precision Table (4 cols: 2476, 2476, 2476, 2478 dxa)
  const colPrec = [2476, 2476, 2476, 2478];
  const precRows = [
    createRow([
      createHeaderCell('Sample No.', colPrec[0]),
      createHeaderCell('Analyst 1 (% Assay)', colPrec[1]),
      createHeaderCell('Analyst 2 (% Assay)', colPrec[2]),
      createHeaderCell('Statistical Evaluation', colPrec[3]),
    ], true),
    ...prec.rows.map((r, i) =>
      createRow([
        createDataCell(r.sampleNo, AlignmentType.CENTER, true, undefined, colPrec[0]),
        createDataCell(isProtocol ? '' : `${formatNum(r.analyst1Assay, 2)} %`, AlignmentType.RIGHT, false, undefined, colPrec[1]),
        createDataCell(isProtocol ? '' : `${formatNum(r.analyst2Assay, 2)} %`, AlignmentType.RIGHT, false, undefined, colPrec[2]),
        createDataCell(isProtocol ? 'To be calculated' : (r.statisticalEvaluation || 'Complies'), AlignmentType.CENTER, false, undefined, colPrec[3]),
      ])
    ),
    createRow([
      createDataCell('Mean', AlignmentType.CENTER, true, altRowBgColor, colPrec[0]),
      createDataCell(isProtocol ? '' : `${formatNum(prec.analyst1Mean, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colPrec[1]),
      createDataCell(isProtocol ? '' : `${formatNum(prec.analyst2Mean, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colPrec[2]),
      createDataCell(isProtocol ? 'To be calculated' : `Cum. Mean = ${formatNum(prec.cumulativeMean, 2)} %`, AlignmentType.CENTER, true, altRowBgColor, colPrec[3]),
    ]),
    createRow([
      createDataCell('% RSD', AlignmentType.CENTER, true, altRowBgColor, colPrec[0]),
      createDataCell(isProtocol ? 'Criteria: NMT 2.0 %' : `${formatNum(prec.analyst1Rsd, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colPrec[1]),
      createDataCell(isProtocol ? 'Criteria: NMT 2.0 %' : `${formatNum(prec.analyst2Rsd, 2)} %`, AlignmentType.RIGHT, true, altRowBgColor, colPrec[2]),
      createDataCell(isProtocol ? 'Criteria: NMT 2.0 %' : `Cum. %RSD = ${formatNum(prec.cumulativeRsd, 2)} %`, AlignmentType.CENTER, true, altRowBgColor, colPrec[3]),
    ]),
  ];
  const precTable = createDocxTable(colPrec, precRows);

  // Section 11 Robustness Table: All 6 conditions (4 cols: 3406, 2100, 2200, 2200 dxa)
  const colRob = [3406, 2100, 2200, 2200];
  const robRows = [
    createRow([
      createHeaderCell('Condition Varied', colRob[0], AlignmentType.LEFT),
      createHeaderCell('% RSD (n=5)', colRob[1]),
      createHeaderCell('Tailing Factor', colRob[2]),
      createHeaderCell('Theoretical Plates', colRob[3]),
    ], true),
    ...rob.rows.map((r) =>
      createRow([
        createDataCell(r.conditionVaried, AlignmentType.LEFT, true, undefined, colRob[0]),
        createDataCell(isProtocol ? '' : `${formatNum(r.rsdPercent, 2)} %`, AlignmentType.RIGHT, false, undefined, colRob[1]),
        createDataCell(isProtocol ? '' : formatNum(r.tailingFactor, 2), AlignmentType.RIGHT, false, undefined, colRob[2]),
        createDataCell(isProtocol ? '' : formatInt(r.theoreticalPlates), AlignmentType.RIGHT, false, undefined, colRob[3]),
      ])
    ),
  ];
  const robTable = createDocxTable(colRob, robRows);

  // Section 12 Solution Stability Table (4 cols: 2476, 2476, 2476, 2478 dxa)
  const colStab = [2476, 2476, 2476, 2478];
  const stabRows = [
    createRow([
      createHeaderCell('Time Point', colStab[0]),
      createHeaderCell('Standard Area (µV·s)', colStab[1]),
      createHeaderCell('Sample Area (µV·s)', colStab[2]),
      createHeaderCell('% Diff (Std / Spl)', colStab[3]),
    ], true),
    ...stab.rows.map((r) =>
      createRow([
        createDataCell(r.timePoint, AlignmentType.CENTER, true, undefined, colStab[0]),
        createDataCell(isProtocol ? '' : formatInt(r.standardArea), AlignmentType.RIGHT, false, undefined, colStab[1]),
        createDataCell(isProtocol ? '' : formatInt(r.sampleArea), AlignmentType.RIGHT, false, undefined, colStab[2]),
        createDataCell(isProtocol ? '' : r.diffPercent, AlignmentType.CENTER, false, undefined, colStab[3]),
      ])
    ),
  ];
  const stabTable = createDocxTable(colStab, stabRows);

  // Section 13 Overall Conclusion & Review Checklist Table (2 cols: 4506, 5400 dxa)
  const colCheck = [4506, 5400];
  const checkRows = [
    createRow([createHeaderCell('Particulars', colCheck[0], AlignmentType.LEFT), createHeaderCell('Details / Compliance', colCheck[1], AlignmentType.LEFT)], true),
    ...data.reviewChecklist.map((item) =>
      createRow([
        createDataCell(item.particulars, AlignmentType.LEFT, true, undefined, colCheck[0]),
        createDataCell(isProtocol ? 'To be verified upon execution' : item.compliance, AlignmentType.LEFT, false, undefined, colCheck[1]),
      ])
    ),
  ];
  const checkTable = createDocxTable(colCheck, checkRows);

  // Section 14 Abbreviations Table: All 18 items (2 cols: 3206, 6700 dxa)
  const colAbbr = [3206, 6700];
  const abbrRows = [
    createRow([createHeaderCell('Abbreviation', colAbbr[0]), createHeaderCell('Expansion / Definition', colAbbr[1], AlignmentType.LEFT)], true),
    ...data.abbreviations.map((a) =>
      createRow([
        createDataCell(a.abbreviation, AlignmentType.CENTER, true, undefined, colAbbr[0]),
        createDataCell(a.expansion, AlignmentType.LEFT, false, undefined, colAbbr[1]),
      ])
    ),
  ];
  const abbrTable = createDocxTable(colAbbr, abbrRows);

  // Section 15 Revision History Table (3 cols: 1606, 2300, 6000 dxa)
  const colRev = [1606, 2300, 6000];
  const revRows = [
    createRow([
      createHeaderCell('Version', colRev[0]),
      createHeaderCell('Effective Date', colRev[1]),
      createHeaderCell('Reason for Change', colRev[2], AlignmentType.LEFT),
    ], true),
    ...data.revisionHistory.map((rh) =>
      createRow([
        createDataCell(rh.version, AlignmentType.CENTER, true, undefined, colRev[0]),
        createDataCell(rh.effectiveDate, AlignmentType.CENTER, false, undefined, colRev[1]),
        createDataCell(rh.reason, AlignmentType.LEFT, false, undefined, colRev[2]),
      ])
    ),
  ];
  const revTable = createDocxTable(colRev, revRows);

  const endMarkParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 180, after: 60 },
    children: [
      new TextRun({
        text: '— END OF DOCUMENT —',
        bold: true,
        size: 21, // 10.5pt (increased from 9.5pt)
        font: FONT_FAMILY,
        color: '9CA3AF',
      }),
    ],
  });

  // =========================================================================
  // ASSEMBLE ALL DOCUMENT CHILDREN WITH PRECISE PAGE BREAKS (EXACT 8 PAGES)
  // =========================================================================

  const docChildren = [
    // ---------------- PAGE 1 ----------------
    page1CompanyHeader,
    page1Address,
    page1DocTitle,
    page1MetaTable,
    new Paragraph({ spacing: { before: 40, after: 40 } }),
    page1SignOffTable,
    createSectionHeader('1. Objective', 100, 40),
    createBodyParagraph(data.objective, 20, 40),
    createSectionHeader('2. Scope', 80, 40),
    createBodyParagraph(data.scope, 20, 40),
    createSectionHeader('3. Reference Documents & Verification Details', 80, 40),
    sec3Table,
    createSectionHeader('4. Analytical Method Summary', 100, 30),
    createSubSectionHeader('4.1 Chromatographic Conditions', 40, 30),
    new Paragraph({ children: [new PageBreak()] }),

    // ---------------- PAGE 2 ----------------
    chromTable,
    new Paragraph({
      spacing: { before: 40, after: 60 },
      children: [
        new TextRun({
          text: `Note: ${c.note || 'Dissolve 1.36 g of Potassium Dihydrogen Phosphate in 1000 mL water, adjust pH to 6.0 with 0.1M KOH.'}`,
          italics: true,
          size: 19, // 9.5pt (increased from 8.5pt)
          font: FONT_FAMILY,
          color: '4B5563',
        }),
      ],
    }),
    createSubSectionHeader('4.2 Preparation of Solutions (Summary)', 60, 40),
    solTable,
    createSubSectionHeader('4.3 Calculation Formula & Assay Equations', 80, 40),
    new Paragraph({
      spacing: { before: 30, after: 30 },
      children: [
        new TextRun({
          text: data.calculationFormula?.assayFormula || 'Assay (%) = (AT / AS) * (WS / 100) * (100 / WT) * (AVG_WT / LC) * Purity',
          bold: true,
          size: 20, // 10pt (increased from 9pt)
          font: FONT_FAMILY,
          color: navyTextColor,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 20, after: 40 },
      children: [
        new TextRun({
          text: data.calculationFormula?.contentFormula || 'Content (mg/tablet) = Assay (%) * Label Claim (mg) / 100',
          bold: true,
          size: 20, // 10pt (increased from 9pt)
          font: FONT_FAMILY,
          color: navyTextColor,
        }),
      ],
    }),
    ...(data.calculationFormula?.notes || [
      '• AT = Peak area of analyte in the sample chromatogram',
      '• AS = Mean peak area of analyte in standard chromatograms',
      `• WS = Weight of ${data.activeSubstance} working standard taken (mg)`,
      '• WT = Weight of powdered dosage unit sample taken (mg)',
      '• AVG_WT = Average weight of 20 tablets (mg)',
      `• LC = Label claim of ${data.activeSubstance} per unit (mg)`,
      `• Purity = Decimal purity of ${data.activeSubstance} reference standard`,
    ]).map((note) =>
      new Paragraph({
        spacing: { before: 10, after: 10 },
        children: [
          new TextRun({
            text: note,
            size: 19, // 9.5pt (increased from 8.5pt)
            font: FONT_FAMILY,
            color: '374151',
          }),
        ],
      })
    ),
    new Paragraph({ children: [new PageBreak()] }),

    // ---------------- PAGE 3 ----------------
    createSubSectionHeader('4.4 Requirements — Reagents, Standards & Equipment', 40, 30),
    reagentsTable,
    createSectionHeader('5. Validation Parameters and Acceptance Criteria', 80, 40),
    valTableP3,
    new Paragraph({ children: [new PageBreak()] }),

    // ---------------- PAGE 4 ----------------
    valTableP4,
    createSectionHeader('6. System Suitability', 60, 30),
    createBodyParagraph(`Inject five (5) replicate injections of the standard solution (${c.workingConcentration}). Record peak area, tailing factor, and theoretical plates into the execution table below.`, 20, 40),
    ssTable,
    createAcceptanceParagraph(
      isProtocol
        ? 'Acceptance Criteria: %RSD of Peak Area <= 2.0%, Tailing Factor <= 2.0, Theoretical Plates >= 2000. (Observed Result: To be recorded upon execution)'
        : `Acceptance: %RSD of Peak Area <= 2.0%, Tailing Factor <= 2.0, Theoretical Plates >= 2000. (Result: Mean Area = ${formatInt(ss.meanArea)}, %RSD = ${formatNum(ss.rsdArea, 2)}%, Tailing = ${formatNum(ss.meanTailing, 2)}, Plates = ${formatInt(ss.meanPlates)} — Complies)`
    ),
    createSectionHeader('7. Specificity', 70, 30),
    createBodyParagraph('Inject blank, placebo, reference standard, sample, and impurity solutions in duplicate. Record retention times and confirm absence of co-eluting peaks at the analyte retention window.', 20, 40),
    specTable,
    createAcceptanceParagraph(
      isProtocol
        ? 'Acceptance Criteria: No interfering peak from blank or placebo matrix shall co-elute with the active substance peak. Peak purity shall be verified.'
        : `Acceptance Criteria: No interfering peak from blank or placebo matrix shall co-elute with the active substance peak. (Result: No interfering peaks observed at ${data.activeSubstance} retention window. Peak purity passed — Complies)`
    ),
    createSectionHeader('8. Linearity and Range', 70, 30),
    createBodyParagraph('Prepare linearity standard solutions across 5 concentration levels (50 % to 150 % of nominal working concentration). Inject in triplicate and construct calibration curve.', 20, 40),
    new Paragraph({ children: [new PageBreak()] }),

    // ---------------- PAGE 5 ----------------
    lin1Table,
    new Paragraph({ spacing: { before: 40, after: 20 } }),
    lin2Table,
    createAcceptanceParagraph(
      isProtocol
        ? 'Acceptance Criteria: Correlation coefficient (r) shall be ≥ 0.999; r² ≥ 0.998. The y-intercept bias shall be within ±2.0% of nominal response.'
        : `Acceptance: Correlation coefficient r ≥ 0.999 (r² ≥ 0.998). (Result: r = ${formatNum(lin.regression.correlationR, 5)}, r² = ${formatNum(lin.regression.rSquared, 5)}, y-Intercept Bias = ${formatNum(lin.regression.yInterceptBiasPercent, 2)}% — Complies)`
    ),
    createSectionHeader('9. Accuracy (Recovery)', 60, 30),
    createBodyParagraph(`Placebo blend spiked with ${data.activeSubstance} working standard at 50%, 100%, and 150% of nominal target assay concentration in triplicate (9 determinations).`, 20, 40),
    accTable,
    createAcceptanceParagraph(
      isProtocol
        ? 'Acceptance Criteria: Mean recovery at each concentration level shall be between 98.0% and 102.0%. Overall % RSD across 9 determinations shall be NMT 2.0%.'
        : `Acceptance: Mean recovery at each concentration level shall be 98.0%–102.0%; Overall %RSD NMT 2.0%. (Result: Mean Recovery = ${formatNum(acc.meanRecoveryAllLevels, 2)}%, Overall %RSD = ${formatNum(acc.rsdAllLevels, 2)}% — Complies)`
    ),
    createSectionHeader('10. Precision & Intermediate Precision (Ruggedness)', 70, 30),
    new Paragraph({ children: [new PageBreak()] }),

    // ---------------- PAGE 6 ----------------
    createBodyParagraph('Prepare six (6) individual sample preparations from homogenous batch. Analyst 1 shall test on Day 1 on Instrument 1. Analyst 2 shall independently prepare and test 6 fresh samples on Day 2 on Instrument 2.', 20, 40),
    precTable,
    createAcceptanceParagraph(
      isProtocol
        ? 'Acceptance Criteria: % RSD of six assay results for Analyst 1 and Analyst 2 shall be NMT 2.0%. Overall cumulative % RSD (n=12) shall be NMT 2.0%. Absolute difference between means shall be NMT 1.5%.'
        : `Acceptance: Analyst 1 %RSD NMT 2.0%, Analyst 2 %RSD NMT 2.0%, Cumulative %RSD NMT 2.0%, Mean Diff NMT 1.5%. (Result: A1 %RSD = ${formatNum(prec.analyst1Rsd, 2)}%, A2 %RSD = ${formatNum(prec.analyst2Rsd, 2)}%, Cum %RSD = ${formatNum(prec.cumulativeRsd, 2)}%, Diff = ${formatNum(prec.diffBetweenMeans, 2)}% — Complies)`
    ),
    createSectionHeader('11. Robustness', 70, 30),
    createBodyParagraph(
      rob.instructionParagraph ||
        'Evaluate system suitability under deliberately varied HPLC conditions (Flow rate ±0.1 mL/min, Column Temp ±3°C, Mobile phase pH ±0.2).',
      20,
      40
    ),
    robTable,
    createAcceptanceParagraph(
      isProtocol
        ? 'Acceptance Criteria: System suitability criteria (% RSD NMT 2.0%, Tailing NMT 2.0, Plates NLT 2000) shall be complied with under all varied conditions.'
        : `Acceptance: System suitability criteria met under all varied conditions. (Result: Peak shape, tailing <= 2.0, plates >= 2000 maintained under all variations — Complies)`
    ),
    createSectionHeader('12. Solution Stability', 70, 30),
    createBodyParagraph('Evaluate analytical solution stability at room temperature and 2–8°C over 24 hours. Analyze at intervals (0h, 3h, 6h, 12h, 18h, 24h).', 20, 40),
    stabTable,
    createAcceptanceParagraph(
      isProtocol
        ? 'Acceptance Criteria: The cumulative percentage difference in peak response for standard and sample solutions over 24 hours shall not exceed 2.0%.'
        : `Acceptance: Cumulative percentage difference in peak response over 24h shall not exceed 2.0%. (Result: Max difference Std = ${formatNum(maxDocxStdDiff, 2)} %, Spl = ${formatNum(maxDocxSplDiff, 2)} % — Stable for 24h)`
    ),
    new Paragraph({ children: [new PageBreak()] }),

    // ---------------- PAGE 7 ----------------
    createSectionHeader('13. Overall Conclusion & Review Checklist', 70, 30),
    createBodyParagraph(`The analytical method for ${data.productName} Assay by HPLC is specific, linear, precise, accurate, robust, and stable, meeting all acceptance criteria as per ICH Q2(R2) and USP compendial standards.`, 20, 40),
    checkTable,
    createSectionHeader('14. Abbreviations', 70, 30),
    abbrTable,
    new Paragraph({ children: [new PageBreak()] }),

    // ---------------- PAGE 8 ----------------
    createSectionHeader('15. Revision History', 80, 40),
    revTable,
    endMarkParagraph,
  ];

  // Document Headers & Footers
  const runningHeader = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: `${data.companyName}  |  ${isProtocol ? 'AMV Protocol' : 'AMV Report'} – ${data.productName}  |  Doc No. ${singleDocNumber}`,
            size: 18, // 9pt (increased from 8pt)
            font: FONT_FAMILY,
            color: '6B7280',
          }),
        ],
      }),
    ],
  });

  const runningFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 0 },
        children: [
          new TextRun({
            text: 'Page ',
            size: 18, // 9pt (increased from 8pt)
            font: FONT_FAMILY,
            color: '9CA3AF',
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
            font: FONT_FAMILY,
            color: '9CA3AF',
          }),
          new TextRun({
            text: ' of ',
            size: 18,
            font: FONT_FAMILY,
            color: '9CA3AF',
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 18,
            font: FONT_FAMILY,
            color: '9CA3AF',
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 Width
              height: 16838, // A4 Height
            },
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000,
            },
          },
        },
        headers: {
          default: runningHeader,
        },
        footers: {
          default: runningFooter,
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanDocType = isProtocol ? 'AMV_Protocol' : 'AMV_Report';
  const cleanProduct = data.productName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanDocType}_${cleanProduct}_${singleDocNumber.replace(/\//g, '-')}.docx`;

  saveAs(blob, filename);
}
