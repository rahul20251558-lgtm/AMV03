import {
  Document,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  Packer,
} from 'docx';
import saveAs from 'file-saver';
import { DissolutionAMVDocumentData, ThemeFormat, DocumentType } from '../types';

export interface DissolutionDocxOptions {
  theme?: ThemeFormat;
  docType?: DocumentType;
  fontFamily?: string;
  fontSize?: number;
}

export async function generateAndDownloadDissolutionDocx(
  data: DissolutionAMVDocumentData,
  options: DissolutionDocxOptions = {}
): Promise<void> {
  const isProtocol = (options.docType || 'report') === 'protocol';
  const isBlue = (options.theme || 'blue') === 'blue';

  const navyTextColor = isBlue ? '1F4E79' : '111827';
  const tableHeaderBgColor = isBlue ? '1F4E79' : '374151';
  const metaLabelBgColor = isBlue ? 'F0F4F8' : 'F9FAFB';
  const altRowBgColor = isBlue ? 'F8FAFC' : 'F9FAFB';
  const borderHex = isBlue ? 'B0C4DE' : 'D1D5DB';

  // Times New Roman (12pt default) matching authentic regulatory monograph
  const FONT_FAMILY = options.fontFamily || 'Times New Roman';
  const BASE_FONT_HALF_PT = (options.fontSize || 12) * 2;
  const TABLE_CELL_SIZE = Math.max(16, BASE_FONT_HALF_PT - 4);
  const SECTION_HEAD_SIZE = BASE_FONT_HALF_PT + 2;
  const SUBSECTION_HEAD_SIZE = BASE_FONT_HALF_PT;
  const BODY_SIZE = BASE_FONT_HALF_PT;
  const TOTAL_TABLE_WIDTH_DXA = 9906; // 6.88 inches standard text area

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: borderHex },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: borderHex },
    left: { style: BorderStyle.SINGLE, size: 4, color: borderHex },
    right: { style: BorderStyle.SINGLE, size: 4, color: borderHex },
  };

  const cellMargins = { top: 70, bottom: 70, left: 100, right: 100 };

  const createHeaderCell = (
    text: string,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER,
    widthDxa?: number
  ) => {
    return new TableCell({
      shading: { fill: tableHeaderBgColor },
      borders: cellBorder,
      margins: cellMargins,
      width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : undefined,
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({
              text,
              bold: true,
              size: TABLE_CELL_SIZE,
              font: FONT_FAMILY,
              color: 'FFFFFF',
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

  const createSectionHeader = (title: string, beforeSpace = 140, afterSpace = 50) => {
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

  const createSubSectionHeader = (title: string, beforeSpace = 90, afterSpace = 40) => {
    return new Paragraph({
      spacing: { before: beforeSpace, after: afterSpace },
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
  };

  const createBodyText = (text: string, beforeSpace = 40, afterSpace = 50) => {
    return new Paragraph({
      spacing: { before: beforeSpace, after: afterSpace, line: 260 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text,
          size: BODY_SIZE,
          font: FONT_FAMILY,
          color: '1F2937',
        }),
      ],
    });
  };

  const createConclusionBlock = (label: string, text: string) => {
    return new Paragraph({
      spacing: { before: 50, after: 90, line: 260 },
      children: [
        new TextRun({
          text: `${label}: `,
          bold: true,
          size: BODY_SIZE,
          font: FONT_FAMILY,
          color: isBlue ? '1E3A8A' : '111827',
        }),
        new TextRun({
          text: isProtocol ? '' : text,
          bold: false,
          size: BODY_SIZE,
          font: FONT_FAMILY,
          color: '1F2937',
        }),
      ],
    });
  };

  const docElements: (Paragraph | Table)[] = [];

  // ================= TITLE BLOCK =================
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
      spacing: { before: 10, after: 40 },
      children: [
        new TextRun({
          text: isProtocol
            ? 'ANALYTICAL METHOD VERIFICATION PROTOCOL'
            : 'ANALYTICAL METHOD VERIFICATION REPORT',
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
          text: '(For DISSOLUTION Method)',
          bold: true,
          size: 22,
          font: FONT_FAMILY,
          color: '4B5563',
        }),
      ],
    })
  );

  // Metadata Table
  const metaColWidths = [2800, 7106];
  const metaRows: TableRow[] = [
    createRow([
      createDataCell(isProtocol ? 'Protocol No.' : 'Report No.', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.protocolNo, AlignmentType.LEFT, true, undefined, 7106),
    ]),
    createRow([
      createDataCell(isProtocol ? 'Protocol Date' : 'Report Date', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.protocolDate, AlignmentType.LEFT, false, undefined, 7106),
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
      createDataCell(data.testParameter, AlignmentType.LEFT, true, undefined, 7106),
    ]),
    createRow([
      createDataCell('Reference', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.reference, AlignmentType.LEFT, false, undefined, 7106),
    ]),
    createRow([
      createDataCell(isProtocol ? 'Batch No. to be used' : 'Batch No. used', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(isProtocol ? '' : data.batchNoUsed, AlignmentType.LEFT, true, undefined, 7106),
    ]),
    ...(data.supersedes
      ? [
          createRow([
            createDataCell('Supersedes', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
            createDataCell(data.supersedes, AlignmentType.LEFT, false, undefined, 7106),
          ]),
        ]
      : []),
  ];
  docElements.push(createDocxTable(metaColWidths, metaRows));

  // Approvals / Sign-Off Table
  docElements.push(createSectionHeader('APPROVALS / SIGN-OFF', 120, 40));
  const signColWidths = [2200, 2600, 2600, 2506];
  const signRows: TableRow[] = [
    createRow([
      createHeaderCell('Activity', AlignmentType.LEFT, 2200),
      createHeaderCell('Designation', AlignmentType.LEFT, 2600),
      createHeaderCell('Name', AlignmentType.LEFT, 2600),
      createHeaderCell('Signature & Date', AlignmentType.CENTER, 2506),
    ], true),
    createRow([
      createDataCell('Prepared By', AlignmentType.LEFT, true, undefined, 2200),
      createDataCell(isProtocol ? '' : data.signOffs.preparedBy.designation, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? '' : data.signOffs.preparedBy.name, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? '' : `${data.signOffs.preparedBy.name} / ${data.signOffs.preparedBy.date}`, AlignmentType.CENTER, false, undefined, 2506),
    ]),
    createRow([
      createDataCell('Checked By', AlignmentType.LEFT, true, undefined, 2200),
      createDataCell(isProtocol ? '' : data.signOffs.checkedBy.designation, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? '' : data.signOffs.checkedBy.name, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? '' : `${data.signOffs.checkedBy.name} / ${data.signOffs.checkedBy.date}`, AlignmentType.CENTER, false, undefined, 2506),
    ]),
    createRow([
      createDataCell('Reviewed By', AlignmentType.LEFT, true, undefined, 2200),
      createDataCell(isProtocol ? '' : data.signOffs.reviewedBy.designation, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? '' : data.signOffs.reviewedBy.name, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? '' : `${data.signOffs.reviewedBy.name} / ${data.signOffs.reviewedBy.date}`, AlignmentType.CENTER, false, undefined, 2506),
    ]),
    createRow([
      createDataCell('Authorized By', AlignmentType.LEFT, true, undefined, 2200),
      createDataCell(isProtocol ? '' : data.signOffs.authorisedBy.designation, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? '' : data.signOffs.authorisedBy.name, AlignmentType.LEFT, false, undefined, 2600),
      createDataCell(isProtocol ? '' : `${data.signOffs.authorisedBy.name} / ${data.signOffs.authorisedBy.date}`, AlignmentType.CENTER, false, undefined, 2506),
    ]),
  ];
  docElements.push(createDocxTable(signColWidths, signRows));

  // 1. OBJECTIVE
  docElements.push(createSectionHeader('1. OBJECTIVE'));
  docElements.push(createBodyText(data.objective));

  // 2. SCOPE
  docElements.push(createSectionHeader('2. SCOPE'));
  docElements.push(createBodyText(data.scope));

  // 3. REFERENCE AND VERIFICATION DETAILS
  docElements.push(createSectionHeader('3. REFERENCE AND VERIFICATION DETAILS'));
  const refColWidths = [2800, 7106];
  const refRows: TableRow[] = [
    createRow([
      createDataCell('Reference', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.referenceDetails.reference, AlignmentType.LEFT, false, undefined, 7106),
    ]),
    createRow([
      createDataCell('Type of study', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.referenceDetails.typeOfStudy, AlignmentType.LEFT, false, undefined, 7106),
    ]),
    createRow([
      createDataCell('Test to be verified', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.referenceDetails.testToBeVerified, AlignmentType.LEFT, true, undefined, 7106),
    ]),
    createRow([
      createDataCell('Verification team', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.referenceDetails.verificationTeam, AlignmentType.LEFT, false, undefined, 7106),
    ]),
    createRow([
      createDataCell('Experimental details', AlignmentType.LEFT, true, metaLabelBgColor, 2800),
      createDataCell(data.referenceDetails.experimentalDetails, AlignmentType.LEFT, false, undefined, 7106),
    ]),
  ];
  docElements.push(createDocxTable(refColWidths, refRows));

  // 4. ANALYTICAL METHOD SUMMARY
  docElements.push(createSectionHeader('4. ANALYTICAL METHOD SUMMARY'));
  docElements.push(createSubSectionHeader('4.1 Chromatographic Conditions'));
  const cc = data.methodSummary.chromatographicConditions;
  const ccColWidths = [3300, 6606];
  const ccRows: TableRow[] = [
    createRow([createDataCell('Instrument / Detector', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.instrument, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Column', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.column, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Mobile Phase', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.mobilePhase, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Mode of Elution', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.modeOfElution, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Flow Rate', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.flowRate, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Column Temperature', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.columnTemperature, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Detection Wavelength', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.detectionWavelength, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Injection Volume', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.injectionVolume, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Diluent', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.diluent, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Determination of Content', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(cc.determinationOfContent, AlignmentType.LEFT, false, undefined, 6606)]),
  ];
  docElements.push(createDocxTable(ccColWidths, ccRows));

  // 4.2 Dissolution Test Conditions
  docElements.push(createSubSectionHeader('4.2 Dissolution Test Conditions'));
  const dc = data.methodSummary.dissolutionConditions;
  const dcRows: TableRow[] = [
    createRow([createDataCell('Compliance', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(dc.compliance, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Apparatus', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(dc.apparatus, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([
      createDataCell(
        dc.apparatus.includes('1') || dc.apparatus.toLowerCase().includes('basket') ? 'Basket Speed' : 'Paddle Speed',
        AlignmentType.LEFT,
        true,
        metaLabelBgColor,
        3300
      ),
      createDataCell(dc.paddleSpeed, AlignmentType.LEFT, false, undefined, 6606),
    ]),
    createRow([createDataCell('Medium', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(dc.medium, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Medium Temperature', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(dc.mediumTemperature, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Sampling Time', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(dc.samplingTime, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Sample Treatment', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(dc.sampleTreatment, AlignmentType.LEFT, false, undefined, 6606)]),
    createRow([createDataCell('Number of Units', AlignmentType.LEFT, true, metaLabelBgColor, 3300), createDataCell(dc.numberOfUnits, AlignmentType.LEFT, false, undefined, 6606)]),
  ];
  docElements.push(createDocxTable(ccColWidths, dcRows));

  // 4.3 Preparation of Solutions
  docElements.push(createSubSectionHeader('4.3 Preparation of Solutions'));
  const sp = data.methodSummary.solutionPreparation;
  docElements.push(
    createBodyText(`Solution (1) — Test Solution: ${sp.testSolution}`),
    createBodyText(`Solution (2) — Standard Solution: ${sp.standardSolution}`),
    createBodyText(`Blank: ${sp.blank}`),
    createBodyText(`Placebo Solution: ${sp.placeboSolution}`),
    createBodyText(`Precision — Standard Solution: ${sp.precisionStandardSolution}`),
    createBodyText(`Precision — Sample Solution: ${sp.precisionSampleSolution}`),
    createBodyText(`Linearity Solutions: ${sp.linearitySolutions}`),
    createBodyText(`Handling Note: ${sp.handlingNote}`)
  );

  // 4.4 Limits (as per the monograph)
  docElements.push(createSubSectionHeader('4.4 Limits (as per the monograph)'));
  const lim = data.methodSummary.monographLimits;
  const limColWidths = [4500, 5406];
  const limRows: TableRow[] = [
    createRow([
      createHeaderCell('Criterion', AlignmentType.LEFT, 4500),
      createHeaderCell('Limit', AlignmentType.LEFT, 5406),
    ], true),
    createRow([
      createDataCell(lim.criterion, AlignmentType.LEFT, true, undefined, 4500),
      createDataCell(lim.limit, AlignmentType.LEFT, true, undefined, 5406),
    ]),
    createRow([
      createDataCell('Basis of calculation', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(lim.basisOfCalculation, AlignmentType.LEFT, false, undefined, 5406),
    ]),
  ];
  docElements.push(createDocxTable(limColWidths, limRows));

  // 4.5 Requirements (Materials, Reagents & Consumables)
  docElements.push(createSubSectionHeader('4.5 Requirements (Materials, Reagents & Consumables)'));
  const reqColWidths = [3200, 3000, 2000, 1706];
  const reqRows: TableRow[] = [
    createRow([
      createHeaderCell('Name of Material', AlignmentType.LEFT, 3200),
      createHeaderCell('Grade', AlignmentType.LEFT, 3000),
      createHeaderCell('Make', AlignmentType.LEFT, 2000),
      createHeaderCell('Batch No.', AlignmentType.LEFT, 1706),
    ], true),
    ...data.methodSummary.requirements.map((req, i) =>
      createRow([
        createDataCell(req.name, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 3200),
        createDataCell(req.grade, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 3000),
        createDataCell(req.make, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 2000),
        createDataCell(req.batchNo, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 1706),
      ])
    ),
  ];
  docElements.push(createDocxTable(reqColWidths, reqRows));

  // 5. VERIFICATION PARAMETERS — ACCEPTANCE CRITERIA
  docElements.push(createSectionHeader('5. VERIFICATION PARAMETERS — ACCEPTANCE CRITERIA'));
  const vpColWidths = [1000, 2700, 4206, 2000];
  const vpRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr.', AlignmentType.CENTER, 1000),
      createHeaderCell('Parameter', AlignmentType.LEFT, 2700),
      createHeaderCell('Acceptance Criteria', AlignmentType.LEFT, 4206),
      createHeaderCell('Execution Status', AlignmentType.CENTER, 2000),
    ], true),
    ...data.validationParameters.map((vp, i) =>
      createRow([
        createDataCell(vp.srNo, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 1000),
        createDataCell(vp.parameter, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 2700),
        createDataCell(vp.acceptanceCriteria, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 4206),
        createDataCell(
          isProtocol ? vp.executionStatusProtocol : vp.executionStatusReport,
          AlignmentType.CENTER,
          true,
          i % 2 === 1 ? altRowBgColor : undefined,
          2000
        ),
      ])
    ),
  ];
  docElements.push(createDocxTable(vpColWidths, vpRows));

  // 6. SYSTEM SUITABILITY (Format matches authentic QC Monograph Report)
  const numPrep = data.systemSuitability.injections.length || 6;
  const numPrepWord = numPrep === 6 ? 'six' : numPrep === 5 ? 'five' : `${numPrep}`;
  docElements.push(createSectionHeader('6. SYSTEM SUITABILITY'));
  docElements.push(
    createBodyText(
      `A set of parameters and criteria thereof to ensure that the system is working properly. System suitability is performed during the entire verification of this method by preparing ${numPrepWord} preparations of the same concentration of the standard, and the results are evaluated by the application of statistical techniques, i.e. Mean, Standard Deviation and Relative Standard Deviation (%).`
    )
  );

  const ssStats = data.systemSuitability.stats;
  const ssColWidths = [5000, 4906];
  const ssStatColWidths = [4500, 2700, 2706];
  const ssRows: TableRow[] = [
    createRow([
      createHeaderCell('Working Standard Weight (mg)', AlignmentType.CENTER, 5000),
      createHeaderCell('area', AlignmentType.CENTER, 4906),
    ], true),
    ...data.systemSuitability.injections.map((inj, i) =>
      createRow([
        createDataCell(isProtocol ? '' : inj.weightMg, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 5000),
        createDataCell(
          isProtocol
            ? ''
            : typeof inj.peakArea === 'number'
            ? inj.peakArea.toLocaleString()
            : inj.peakArea,
          AlignmentType.CENTER,
          false,
          i % 2 === 1 ? altRowBgColor : undefined,
          4906
        ),
      ])
    ),
    // Integrated Summary Rows (as per authentic QC lab verification report)
    createRow([
      createDataCell('Mean', AlignmentType.RIGHT, true, metaLabelBgColor, 5000),
      createDataCell(
        isProtocol
          ? ''
          : typeof ssStats.meanArea === 'number'
          ? ssStats.meanArea.toLocaleString()
          : ssStats.meanArea,
        AlignmentType.CENTER,
        true,
        undefined,
        4906
      ),
    ]),
    createRow([
      createDataCell('RSD (NMT 2.0%)', AlignmentType.RIGHT, true, metaLabelBgColor, 5000),
      createDataCell(
        isProtocol ? 'To be evaluated' : `${ssStats.rsdArea} %`,
        AlignmentType.CENTER,
        true,
        undefined,
        4906
      ),
    ]),
  ];
  docElements.push(createDocxTable(ssColWidths, ssRows));
  docElements.push(createConclusionBlock('Conclusion', isProtocol ? ssStats.conclusionProtocol : ssStats.conclusionReport));

  // 7. SPECIFICITY & SELECTIVITY (BLANK, PLACEBO & FORCED DEGRADATION)
  if (data.specificity) {
    docElements.push(createSectionHeader('7. SPECIFICITY & SELECTIVITY (BLANK, PLACEBO & FORCED DEGRADATION)'));
    const stdRow = data.specificity.solutionRows.find((r) => r.solutionName.toLowerCase().includes('standard'));
    const analyteRtStr = stdRow?.retentionTime && stdRow.retentionTime !== '—' ? ` (~${stdRow.retentionTime})` : '';
    docElements.push(
      createBodyText(
        `Specificity is the ability to assess unequivocally the analyte in the presence of components that may be expected to be present, such as impurities, degradation products, and matrix components. Specificity is established by demonstrating that blank diluent and placebo matrix do not exhibit interfering peaks at the retention window of the active drug substance${analyteRtStr}, and that under forced degradation stress conditions (Acid, Base, Oxidation, Thermal, Photolytic), all generated degradation products are chromatographically resolved from the active drug peak with a resolution factor (Rs) of NLT 2.0, with confirmed spectral peak purity.`
      )
    );

    // 7.1 Solution Interference Table
    docElements.push(createSubSectionHeader('7.1 Blank, Placebo & Test Solution Interference'));
    const specSolColWidths = [3400, 1800, 2000, 2706];
    const specSolRows: TableRow[] = [
      createRow([
        createHeaderCell('Solution Description', AlignmentType.LEFT, 3400),
        createHeaderCell('Retention Time', AlignmentType.CENTER, 1800),
        createHeaderCell('Peak Area', AlignmentType.CENTER, 2000),
        createHeaderCell('Interference / Remark', AlignmentType.LEFT, 2706),
      ], true),
      ...data.specificity.solutionRows.map((row, i) =>
        createRow([
          createDataCell(row.solutionName, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 3400),
          createDataCell(isProtocol ? '—' : row.retentionTime, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1800),
          createDataCell(isProtocol ? '—' : row.peakArea, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 2000),
          createDataCell(isProtocol ? 'To be verified' : row.interferenceObserved, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 2706),
        ])
      ),
    ];
    docElements.push(createDocxTable(specSolColWidths, specSolRows));

    // 7.2 Forced Degradation Table
    docElements.push(createSubSectionHeader('7.2 Forced Degradation & Stress Testing (Stability-Indicating Evaluation)'));
    docElements.push(
      createBodyText(
        'Stress testing was conducted across five regulatory stress conditions. In all stress samples, an extra peak is consistently observed at RT ~3.65 min (labeled Impurity / Degradant, RRT ~0.65). Baseline resolution (Rs > 2.0) and photodiode array (PDA) spectral peak purity were evaluated.'
      )
    );

    const specStressColWidths = [2106, 1200, 1200, 1350, 1350, 1350, 1350];
    const specStressRows: TableRow[] = [
      createRow([
        createHeaderCell('Stress Condition', AlignmentType.LEFT, 2106),
        createHeaderCell('Degradant RT', AlignmentType.CENTER, 1200),
        createHeaderCell('Active RT', AlignmentType.CENTER, 1200),
        createHeaderCell('Degradant Area', AlignmentType.RIGHT, 1350),
        createHeaderCell('Active Area', AlignmentType.RIGHT, 1350),
        createHeaderCell('% Degradation', AlignmentType.CENTER, 1350),
        createHeaderCell('Resolution (Rs)', AlignmentType.CENTER, 1350),
      ], true),
      ...data.specificity.stressRows.map((row, i) =>
        createRow([
          createDataCell(`${row.condition} (${row.stressParameters})`, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 2106),
          createDataCell(isProtocol ? '—' : `${row.degradantRtMin} min`, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1200),
          createDataCell(isProtocol ? '—' : `${row.activeRtMin} min`, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1200),
          createDataCell(isProtocol ? '—' : (typeof row.degradantPeakArea === 'number' ? row.degradantPeakArea.toLocaleString() : row.degradantPeakArea), AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1350),
          createDataCell(isProtocol ? '—' : (typeof row.activePeakArea === 'number' ? row.activePeakArea.toLocaleString() : row.activePeakArea), AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1350),
          createDataCell(isProtocol ? '—' : `${row.degradationPercent} %`, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1350),
          createDataCell(isProtocol ? 'NLT 2.0' : row.resolution, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 1350),
        ])
      ),
    ];
    docElements.push(createDocxTable(specStressColWidths, specStressRows));

    docElements.push(
      createBodyText(
        `Scientific & Regulatory Assessment of the ~3.65 min Peak: ${data.specificity.degradationAssessment}`
      )
    );
    docElements.push(
      createConclusionBlock(
        'Conclusion',
        isProtocol ? data.specificity.acceptanceTextProtocol : data.specificity.conclusionReport
      )
    );
  }

  // 8. LINEARITY AND RANGE
  docElements.push(createSectionHeader('8. LINEARITY AND RANGE'));
  docElements.push(createSubSectionHeader('8.1 Linearity'));
  docElements.push(
    createBodyText(
      'A calibration curve is a general method for determining the concentration of a substance in an unknown sample by comparing it to a set of standard solutions of known concentration. Concentration is plotted along the x-axis and the response (peak area) along the y-axis; the points obtained from the calibration standards are plotted and the line through them represents the calibration curve.'
    )
  );

  const linColWidths = [2400, 2000, 1800, 1800, 1906];
  const linRows: TableRow[] = [
    createRow([
      createHeaderCell('Level', AlignmentType.LEFT, 2400),
      createHeaderCell('Nominal (ppm)', AlignmentType.CENTER, 2000),
      createHeaderCell('Weight (mg)', AlignmentType.CENTER, 1800),
      createHeaderCell('Final Dilution', AlignmentType.CENTER, 1800),
      createHeaderCell('Mean Peak Area', AlignmentType.CENTER, 1906),
    ], true),
    ...data.linearity.levels.map((lvl, i) =>
      createRow([
        createDataCell(lvl.levelName, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 2400),
        createDataCell(lvl.nominalPpm, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 2000),
        createDataCell(isProtocol ? '' : lvl.weightMg, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1800),
        createDataCell(lvl.finalDilution, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1800),
        createDataCell(isProtocol ? '' : lvl.meanArea, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1906),
      ])
    ),
  ];
  docElements.push(createDocxTable(linColWidths, linRows));

  // Regression Table
  const reg = data.linearity.regression;
  const regRows: TableRow[] = [
    createRow([
      createDataCell('Correlation Coefficient (r²)', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? 'Criteria: > 0.995' : reg.rSquared, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: > 0.995', AlignmentType.LEFT, true, undefined, 2706),
    ]),
    createRow([
      createDataCell('Slope (S)', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : reg.slope, AlignmentType.CENTER, false, undefined, 2700),
      createDataCell('Record value', AlignmentType.LEFT, false, undefined, 2706),
    ]),
    createRow([
      createDataCell('y-Intercept (c)', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : reg.yIntercept, AlignmentType.CENTER, false, undefined, 2700),
      createDataCell('Record value', AlignmentType.LEFT, false, undefined, 2706),
    ]),
  ];
  docElements.push(createDocxTable(ssStatColWidths, regRows));
  docElements.push(createConclusionBlock('Conclusion', isProtocol ? reg.conclusionProtocol : reg.conclusionReport));

  // 8.2 Range
  docElements.push(createSubSectionHeader('8.2 Range'));
  docElements.push(
    createBodyText(
      'The data obtained during the linearity and accuracy studies is used to assess the range of the method. The precision data used for the assessment is the precision of the three replicate samples analysed at each level. The sample solutions of 75 ppm and 125 ppm of the nominal concentration prepared under linearity are used.'
    )
  );

  const rngColWidths = [1200, 2200, 3300, 3206];
  const rngRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr.', AlignmentType.CENTER, 1200),
      createHeaderCell('Level (ppm)', AlignmentType.CENTER, 2200),
      createHeaderCell('Sample ID', AlignmentType.LEFT, 3300),
      createHeaderCell('Peak Area', AlignmentType.CENTER, 3206),
    ], true),
    ...data.range.rows.map((rng, i) =>
      createRow([
        createDataCell(rng.srNo, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1200),
        createDataCell(rng.levelPpm, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 2200),
        createDataCell(rng.sampleId, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 3300),
        createDataCell(isProtocol ? '' : rng.peakArea, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 3206),
      ])
    ),
  ];
  docElements.push(createDocxTable(rngColWidths, rngRows));

  // Range Stats
  const rngStats = data.range.stats;
  const rngStatRows: TableRow[] = [
    createRow([
      createDataCell('Mean / SD at 75 ppm', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : rngStats.mean75, AlignmentType.CENTER, false, undefined, 2700),
      createDataCell('Record value', AlignmentType.LEFT, false, undefined, 2706),
    ]),
    createRow([
      createDataCell('% RSD at 75 ppm', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? 'To be evaluated' : `${rngStats.rsd75} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: ≤ 2.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
    createRow([
      createDataCell('Mean / SD at 125 ppm', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : rngStats.mean125, AlignmentType.CENTER, false, undefined, 2700),
      createDataCell('Record value', AlignmentType.LEFT, false, undefined, 2706),
    ]),
    createRow([
      createDataCell('% RSD at 125 ppm', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? 'To be evaluated' : `${rngStats.rsd125} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: ≤ 2.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
  ];
  docElements.push(createDocxTable(ssStatColWidths, rngStatRows));
  docElements.push(createConclusionBlock('Conclusion', isProtocol ? rngStats.conclusionProtocol : rngStats.conclusionReport));

  // 9. PRECISION (REPEATABILITY)
  docElements.push(createSectionHeader('9. PRECISION (REPEATABILITY)'));
  docElements.push(
    createBodyText(
      'Precision is the degree of repeatability of an analytical method under normal operational conditions. Precision may also be expressed by the terms Intermediate Precision and Repeatability. Six sample preparations are analysed against the standard solution and the content is calculated as a percentage of the label amount.'
    )
  );

  const precColWidths = [1200, 2700, 2200, 2000, 1806];
  const precRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr. No.', AlignmentType.CENTER, 1200),
      createHeaderCell('Sample ID', AlignmentType.LEFT, 2700),
      createHeaderCell('Amount of prep used (mg)', AlignmentType.CENTER, 2200),
      createHeaderCell('Sample Area', AlignmentType.CENTER, 2000),
      createHeaderCell('Content (% of LA)', AlignmentType.CENTER, 1806),
    ], true),
    ...data.precision.rows.map((row, i) =>
      createRow([
        createDataCell(row.srNo, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1200),
        createDataCell(row.sampleId, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 2700),
        createDataCell(isProtocol ? '' : row.amountUsedMg, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 2200),
        createDataCell(isProtocol ? '' : row.sampleArea, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 2000),
        createDataCell(isProtocol ? '' : `${row.contentPercentLa} %`, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1806),
      ])
    ),
  ];
  docElements.push(createDocxTable(precColWidths, precRows));

  const pStats = data.precision.stats;
  const precStatRows: TableRow[] = [
    createRow([
      createDataCell('Mean Content (% of LA)', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : `${pStats.meanContent} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: Record value', AlignmentType.LEFT, false, undefined, 2706),
    ]),
    createRow([
      createDataCell('% RSD of Content', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? 'To be evaluated' : `${pStats.rsdContent} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: NMT 2.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
  ];
  docElements.push(createDocxTable(ssStatColWidths, precStatRows));
  docElements.push(createConclusionBlock('Conclusion', isProtocol ? pStats.conclusionProtocol : pStats.conclusionReport));

  // 10. INTERMEDIATE PRECISION (ANALYST 1 VS ANALYST 2)
  docElements.push(createSectionHeader('10. INTERMEDIATE PRECISION (ANALYST 1 VS ANALYST 2)'));
  docElements.push(
    createBodyText(
      'Intermediate precision refers to variations within a laboratory, as with different instruments, on different days and by different analysts. Six preparations are analysed by each analyst using the standard and sample solutions described in section 4.3.'
    )
  );

  const ipColWidths = [800, 1500, 1500, 1500, 1500, 1500, 1606];
  const ipRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr.', AlignmentType.CENTER, 800),
      createHeaderCell('Analyst 1 Amount (mg)', AlignmentType.CENTER, 1500),
      createHeaderCell('Analyst 1 Area', AlignmentType.CENTER, 1500),
      createHeaderCell('Analyst 1 % LA', AlignmentType.CENTER, 1500),
      createHeaderCell('Analyst 2 Amount (mg)', AlignmentType.CENTER, 1500),
      createHeaderCell('Analyst 2 Area', AlignmentType.CENTER, 1500),
      createHeaderCell('Analyst 2 % LA', AlignmentType.CENTER, 1606),
    ], true),
    ...data.intermediatePrecision.rows.map((row, i) =>
      createRow([
        createDataCell(row.srNo, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 800),
        createDataCell(isProtocol ? '' : row.analyst1AmountMg, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1500),
        createDataCell(isProtocol ? '' : row.analyst1Area, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1500),
        createDataCell(isProtocol ? '' : `${row.analyst1PercentLa} %`, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1500),
        createDataCell(isProtocol ? '' : row.analyst2AmountMg, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1500),
        createDataCell(isProtocol ? '' : row.analyst2Area, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1500),
        createDataCell(isProtocol ? '' : `${row.analyst2PercentLa} %`, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1606),
      ])
    ),
  ];
  docElements.push(createDocxTable(ipColWidths, ipRows));

  const ipStats = data.intermediatePrecision.stats;
  const ipStatRows: TableRow[] = [
    createRow([
      createDataCell('Mean % LA — Analyst 1 / Analyst 2', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : `${ipStats.analyst1Mean} % / ${ipStats.analyst2Mean} %`, AlignmentType.CENTER, false, undefined, 2700),
      createDataCell('Acceptance: Record value', AlignmentType.LEFT, false, undefined, 2706),
    ]),
    createRow([
      createDataCell('% RSD — Analyst 1', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? 'To be evaluated' : `${ipStats.analyst1Rsd} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: NMT 2.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
    createRow([
      createDataCell('% RSD — Analyst 2', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? 'To be evaluated' : `${ipStats.analyst2Rsd} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: NMT 2.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
    createRow([
      createDataCell('Cumulative % RSD (twelve results)', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? 'To be evaluated' : `${ipStats.cumulativeRsd} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: NMT 2.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
  ];
  docElements.push(createDocxTable(ssStatColWidths, ipStatRows));
  docElements.push(createConclusionBlock('Conclusion', isProtocol ? ipStats.conclusionProtocol : ipStats.conclusionReport));

  // 11. ACCURACY (RECOVERY)
  docElements.push(createSectionHeader('11. ACCURACY (RECOVERY)'));
  docElements.push(
    createBodyText(
      'The difference between the theoretical added amount and the practically achieved amount is the accuracy of the analytical method. Accuracy is determined at three levels — 75 ppm, 100 ppm and 125 ppm of the target concentration — in triplicate, by spiking a known amount of reference standard into the placebo and processing as per the test method.'
    )
  );

  const accColWidths = [800, 1600, 2000, 1800, 1900, 1806];
  const accRows: TableRow[] = [
    createRow([
      createHeaderCell('Sr.', AlignmentType.CENTER, 800),
      createHeaderCell('Level (ppm)', AlignmentType.CENTER, 1600),
      createHeaderCell('Amount std spiked (mg)', AlignmentType.CENTER, 2000),
      createHeaderCell('Sample Area', AlignmentType.CENTER, 1800),
      createHeaderCell('Amount recovered (mg)', AlignmentType.CENTER, 1900),
      createHeaderCell('% Recovery', AlignmentType.CENTER, 1806),
    ], true),
    ...data.accuracy.rows.map((row, i) =>
      createRow([
        createDataCell(row.srNo, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 800),
        createDataCell(row.levelPpm, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 1600),
        createDataCell(isProtocol ? '' : row.spikedMg, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 2000),
        createDataCell(isProtocol ? '' : row.sampleArea, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1800),
        createDataCell(isProtocol ? '' : row.amountRecoveredMg, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1900),
        createDataCell(isProtocol ? '' : `${row.percentRecovery} %`, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 1806),
      ])
    ),
  ];
  docElements.push(createDocxTable(accColWidths, accRows));

  const accStats = data.accuracy.stats;
  const accStatRows: TableRow[] = [
    createRow([
      createDataCell('Mean % Recovery — 75 ppm', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : `${accStats.meanRecovery75} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: 98.0 % to 102.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
    createRow([
      createDataCell('Mean % Recovery — 100 ppm', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : `${accStats.meanRecovery100} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: 98.0 % to 102.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
    createRow([
      createDataCell('Mean % Recovery — 125 ppm', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? '' : `${accStats.meanRecovery125} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: 98.0 % to 102.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
    createRow([
      createDataCell('% RSD of Recovery', AlignmentType.LEFT, true, metaLabelBgColor, 4500),
      createDataCell(isProtocol ? 'To be evaluated' : `${accStats.overallRsd} %`, AlignmentType.CENTER, true, undefined, 2700),
      createDataCell('Acceptance: NMT 2.0 %', AlignmentType.LEFT, true, undefined, 2706),
    ]),
  ];
  docElements.push(createDocxTable(ssStatColWidths, accStatRows));
  docElements.push(createConclusionBlock('Conclusion', isProtocol ? accStats.conclusionProtocol : accStats.conclusionReport));

  // 12. ROBUSTNESS
  docElements.push(createSectionHeader('12. ROBUSTNESS'));
  docElements.push(
    createBodyText(
      'The robustness of an analytical procedure is a measure of its capacity to remain unaffected by small, but deliberate variations in method parameters and provides an indication of its reliability during normal usage. Deliberate variations in flow rate (±0.1 mL/min), column temperature (±3 °C), and mobile phase organic composition (±2 % v/v) were evaluated. System suitability parameters were verified under each condition.'
    )
  );

  const robColWidths = [2700, 1500, 1400, 1400, 1400, 1506];
  const robRows: TableRow[] = [
    createRow([
      createHeaderCell('Condition / Parameter Varied', AlignmentType.LEFT, 2700),
      createHeaderCell('Rt (min)', AlignmentType.CENTER, 1500),
      createHeaderCell('Tailing (T)', AlignmentType.CENTER, 1400),
      createHeaderCell('Plates (N)', AlignmentType.CENTER, 1400),
      createHeaderCell('% RSD (Std)', AlignmentType.CENTER, 1400),
      createHeaderCell('Remark', AlignmentType.CENTER, 1506),
    ], true),
    ...data.robustness.rows.map((row, i) =>
      createRow([
        createDataCell(row.conditionVaried, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 2700),
        createDataCell(isProtocol ? '—' : `${row.retentionTimeMin} min`, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1500),
        createDataCell(isProtocol ? '—' : row.tailingFactor, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1400),
        createDataCell(isProtocol ? '—' : row.theoreticalPlates, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1400),
        createDataCell(isProtocol ? 'To be evaluated' : `${row.rsdPercent} %`, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 1400),
        createDataCell(isProtocol ? '—' : row.remark, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1506),
      ])
    ),
  ];
  docElements.push(createDocxTable(robColWidths, robRows));
  docElements.push(createConclusionBlock('Conclusion', isProtocol ? data.robustness.conclusionProtocol : data.robustness.conclusionReport));

  // 13. SOLUTION STABILITY
  docElements.push(createSectionHeader('13. SOLUTION STABILITY'));
  docElements.push(
    createBodyText(
      'The stability of the reference standard and sample dissolution solution was evaluated when stored at controlled room temperature (20–25 °C) and refrigerated (2–8 °C) over an extended period (0 h, 12 h, 24 h, and 48 h). Filtered test solutions and standard solutions were analysed at each time point against freshly prepared standard.'
    )
  );

  docElements.push(createSubSectionHeader('13.1 Solution Stability at Controlled Room Temperature (20–25 °C)'));
  const solColWidths = [1800, 1600, 1300, 1600, 1300, 1100, 1206];
  const solRows1: TableRow[] = [
    createRow([
      createHeaderCell('Time Interval', AlignmentType.CENTER, 1800),
      createHeaderCell('Std Area', AlignmentType.RIGHT, 1600),
      createHeaderCell('% Diff (Std)', AlignmentType.CENTER, 1300),
      createHeaderCell('Sample Area', AlignmentType.RIGHT, 1600),
      createHeaderCell('% Diff (Sample)', AlignmentType.CENTER, 1300),
      createHeaderCell('% Dissolved', AlignmentType.CENTER, 1100),
      createHeaderCell('Remark', AlignmentType.CENTER, 1206),
    ], true),
    ...data.solutionStability.rowsRoomTemp.map((row, i) =>
      createRow([
        createDataCell(row.timePoint, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 1800),
        createDataCell(isProtocol ? '—' : typeof row.standardArea === 'number' ? row.standardArea.toLocaleString() : row.standardArea, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1600),
        createDataCell(isProtocol ? '—' : row.standardDiffPercent, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1300),
        createDataCell(isProtocol ? '—' : typeof row.sampleArea === 'number' ? row.sampleArea.toLocaleString() : row.sampleArea, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1600),
        createDataCell(isProtocol ? '—' : row.sampleDiffPercent, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1300),
        createDataCell(isProtocol ? '—' : row.dissolvedPercent, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 1100),
        createDataCell(isProtocol ? '—' : row.remark, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1206),
      ])
    ),
  ];
  docElements.push(createDocxTable(solColWidths, solRows1));

  docElements.push(createSubSectionHeader('13.2 Solution Stability at Refrigerated Temperature (2–8 °C)'));
  const solRows2: TableRow[] = [
    createRow([
      createHeaderCell('Time Interval', AlignmentType.CENTER, 1800),
      createHeaderCell('Std Area', AlignmentType.RIGHT, 1600),
      createHeaderCell('% Diff (Std)', AlignmentType.CENTER, 1300),
      createHeaderCell('Sample Area', AlignmentType.RIGHT, 1600),
      createHeaderCell('% Diff (Sample)', AlignmentType.CENTER, 1300),
      createHeaderCell('% Dissolved', AlignmentType.CENTER, 1100),
      createHeaderCell('Remark', AlignmentType.CENTER, 1206),
    ], true),
    ...data.solutionStability.rowsRefrigerated.map((row, i) =>
      createRow([
        createDataCell(row.timePoint, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 1800),
        createDataCell(isProtocol ? '—' : typeof row.standardArea === 'number' ? row.standardArea.toLocaleString() : row.standardArea, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1600),
        createDataCell(isProtocol ? '—' : row.standardDiffPercent, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1300),
        createDataCell(isProtocol ? '—' : typeof row.sampleArea === 'number' ? row.sampleArea.toLocaleString() : row.sampleArea, AlignmentType.RIGHT, false, i % 2 === 1 ? altRowBgColor : undefined, 1600),
        createDataCell(isProtocol ? '—' : row.sampleDiffPercent, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1300),
        createDataCell(isProtocol ? '—' : row.dissolvedPercent, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 1100),
        createDataCell(isProtocol ? '—' : row.remark, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 1206),
      ])
    ),
  ];
  docElements.push(createDocxTable(solColWidths, solRows2));
  docElements.push(createConclusionBlock('Conclusion', isProtocol ? data.solutionStability.conclusionProtocol : data.solutionStability.conclusionReport));

  // 14. OVERALL CONCLUSION
  docElements.push(createSectionHeader('14. OVERALL CONCLUSION'));
  docElements.push(createBodyText(isProtocol ? data.overallConclusionProtocol : data.overallConclusionReport));

  // 15. COMPLETION RECORD
  docElements.push(createSectionHeader('15. COMPLETION RECORD'));
  const compColWidths = [3800, 3100, 3006];
  const compRows: TableRow[] = [
    createRow([
      createHeaderCell('Particulars', AlignmentType.LEFT, 3800),
      createHeaderCell('Details / Compliance', AlignmentType.LEFT, 3100),
      createHeaderCell('Signature & Date', AlignmentType.CENTER, 3006),
    ], true),
    ...data.completionRecord.map((rec, i) =>
      createRow([
        createDataCell(rec.particulars, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 3800),
        createDataCell(isProtocol ? rec.detailsProtocol : rec.detailsReport, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 3100),
        createDataCell(isProtocol ? rec.signatureDateProtocol : rec.signatureDateReport, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 3006),
      ])
    ),
  ];
  docElements.push(createDocxTable(compColWidths, compRows));

  // 16. ABBREVIATIONS
  docElements.push(createSectionHeader('16. ABBREVIATIONS'));
  const abbColWidths = [2400, 7506];
  const abbRows: TableRow[] = [
    createRow([
      createHeaderCell('Abbreviation', AlignmentType.LEFT, 2400),
      createHeaderCell('Full Form / Expansion', AlignmentType.LEFT, 7506),
    ], true),
    ...data.abbreviations.map((abb, i) =>
      createRow([
        createDataCell(abb.abbreviation, AlignmentType.LEFT, true, i % 2 === 1 ? altRowBgColor : undefined, 2400),
        createDataCell(abb.expansion, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 7506),
      ])
    ),
  ];
  docElements.push(createDocxTable(abbColWidths, abbRows));

  // 17. REVISION HISTORY
  docElements.push(createSectionHeader('17. REVISION HISTORY'));
  const revColWidths = [1500, 2200, 6206];
  const revRows: TableRow[] = [
    createRow([
      createHeaderCell('Version', AlignmentType.CENTER, 1500),
      createHeaderCell('Effective Date', AlignmentType.CENTER, 2200),
      createHeaderCell('Reason for Change', AlignmentType.LEFT, 6206),
    ], true),
    ...data.revisionHistory.map((rev, i) =>
      createRow([
        createDataCell(rev.version, AlignmentType.CENTER, true, i % 2 === 1 ? altRowBgColor : undefined, 1500),
        createDataCell(rev.effectiveDate, AlignmentType.CENTER, false, i % 2 === 1 ? altRowBgColor : undefined, 2200),
        createDataCell(rev.reason || (rev as any).reasonForChange, AlignmentType.LEFT, false, i % 2 === 1 ? altRowBgColor : undefined, 6206),
      ])
    ),
  ];
  docElements.push(createDocxTable(revColWidths, revRows));

  // End of Document marker
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: '— END OF DOCUMENT —',
          bold: true,
          size: 20,
          font: FONT_FAMILY,
          color: '6B7280',
        }),
      ],
    })
  );

  // Build the Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: 20,
            color: '111827',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${data.companyName} | ${data.protocolNo} (${isProtocol ? 'Protocol' : 'Report'})`,
                    size: 16,
                    color: '6B7280',
                    font: FONT_FAMILY,
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
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                    color: '6B7280',
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '6B7280',
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: '6B7280',
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '6B7280',
                    font: FONT_FAMILY,
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
  const cleanDocNo = data.protocolNo.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanProduct = data.productName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanDocNo}_${cleanProduct}_Dissolution_${isProtocol ? 'Protocol' : 'Report'}.docx`;
  saveAs(blob, filename);
}
