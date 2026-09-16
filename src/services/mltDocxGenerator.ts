import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';
import { MLTDocumentData, FooterSignOffData, ThemeFormat } from '../types';
import { getWestCoastStampUint8Array } from '../utils/stampUtils';
import { createDocxSignOffTable } from './docxSignOffFooter';

export interface WestcoastRecoveryItem {
  organism: string;
  dilution: string;
  inoc: number | string;
  samp: number | string;
  test: number | string;
  net: number | string;
  rec: string;
  ratio: string;
  remark: string;
}

export const WESTCOAST_MLT_RECOVERY_BENCHMARK: WestcoastRecoveryItem[] = [
  { organism: 'Staphylococcus aureus', dilution: '1:10', inoc: 89, samp: 1, test: 98, net: 97, rec: '109 %', ratio: '1.09', remark: 'Complies' },
  { organism: 'Staphylococcus aureus', dilution: '1:50', inoc: 71, samp: 1, test: 76, net: 75, rec: '105.6 %', ratio: '1.06', remark: 'Complies' },
  { organism: 'Staphylococcus aureus', dilution: '1:100', inoc: 79, samp: 0, test: 68, net: 68, rec: '86.1 %', ratio: '0.86', remark: 'Complies' },
  { organism: 'Pseudomonas aeruginosa', dilution: '1:10', inoc: 70, samp: 1, test: 63, net: 62, rec: '88.6 %', ratio: '0.89', remark: 'Complies' },
  { organism: 'Pseudomonas aeruginosa', dilution: '1:50', inoc: 73, samp: 0, test: 72, net: 72, rec: '98.6 %', ratio: '0.99', remark: 'Complies' },
  { organism: 'Pseudomonas aeruginosa', dilution: '1:100', inoc: 72, samp: 0, test: 57, net: 57, rec: '79.2 %', ratio: '0.79', remark: 'Complies' },
  { organism: 'Escherichia coli', dilution: '1:10', inoc: 90, samp: 1, test: 80, net: 79, rec: '87.8 %', ratio: '0.88', remark: 'Complies' },
  { organism: 'Escherichia coli', dilution: '1:50', inoc: 80, samp: 0, test: 87, net: 87, rec: '108.7 %', ratio: '1.09', remark: 'Complies' },
  { organism: 'Escherichia coli', dilution: '1:100', inoc: 78, samp: 1, test: 77, net: 76, rec: '97.4 %', ratio: '0.97', remark: 'Complies' },
  { organism: 'Bacillus subtilis', dilution: '1:10', inoc: 80, samp: 0, test: 88, net: 88, rec: '110 %', ratio: '1.1', remark: 'Complies' },
  { organism: 'Bacillus subtilis', dilution: '1:50', inoc: 84, samp: 0, test: 73, net: 73, rec: '86.9 %', ratio: '0.87', remark: 'Complies' },
  { organism: 'Bacillus subtilis', dilution: '1:100', inoc: 81, samp: 0, test: 71, net: 71, rec: '87.7 %', ratio: '0.88', remark: 'Complies' },
  { organism: 'Salmonella enterica Typhimurium', dilution: '1:10', inoc: 71, samp: 1, test: 79, net: 78, rec: '109.9 %', ratio: '1.1', remark: 'Complies' },
  { organism: 'Salmonella enterica Typhimurium', dilution: '1:50', inoc: 71, samp: 1, test: 75, net: 74, rec: '104.2 %', ratio: '1.04', remark: 'Complies' },
  { organism: 'Salmonella enterica Typhimurium', dilution: '1:100', inoc: 82, samp: 1, test: 81, net: 80, rec: '97.6 %', ratio: '0.98', remark: 'Complies' },
  { organism: 'Candida albicans', dilution: '1:10', inoc: 75, samp: 1, test: 79, net: 78, rec: '104 %', ratio: '1.04', remark: 'Complies' },
  { organism: 'Candida albicans', dilution: '1:50', inoc: 94, samp: 0, test: 98, net: 98, rec: '104.3 %', ratio: '1.04', remark: 'Complies' },
  { organism: 'Candida albicans', dilution: '1:100', inoc: 74, samp: 0, test: 55, net: 55, rec: '74.3 %', ratio: '0.74', remark: 'Complies' },
  { organism: 'Aspergillus brasiliensis', dilution: '1:10', inoc: 86, samp: 0, test: 63, net: 63, rec: '73.3 %', ratio: '0.73', remark: 'Complies' },
  { organism: 'Aspergillus brasiliensis', dilution: '1:50', inoc: 94, samp: 0, test: 100, net: 100, rec: '106.4 %', ratio: '1.06', remark: 'Complies' },
  { organism: 'Aspergillus brasiliensis', dilution: '1:100', inoc: 74, samp: 1, test: 77, net: 76, rec: '102.7 %', ratio: '1.03', remark: 'Complies' },
];

export interface WestcoastSpecifiedItem {
  organism: string;
  medium: string;
  pos: string;
  neg: string;
  test: string;
  idResult: string;
}

export const WESTCOAST_MLT_SPECIFIED_BENCHMARK: WestcoastSpecifiedItem[] = [
  { organism: 'Staphylococcus aureus', medium: 'Soybean-Casein Digest Broth / MSA', pos: 'Growth', neg: 'No growth', test: 'No growth', idResult: 'Confirmed' },
  { organism: 'Pseudomonas aeruginosa', medium: 'Soybean-Casein Digest Broth / Cetrimide agar', pos: 'Growth', neg: 'No growth', test: 'No growth', idResult: 'Confirmed' },
  { organism: 'Escherichia coli', medium: 'Soybean-Casein Digest Broth / MacConkey agar', pos: 'Growth', neg: 'No growth', test: 'No growth', idResult: 'Confirmed' },
  { organism: 'Salmonella enterica Typhimurium', medium: 'RVS broth / XLD agar', pos: 'Growth', neg: 'No growth', test: 'No growth', idResult: 'Confirmed' },
  { organism: 'Candida albicans', medium: 'SDB / SDA', pos: 'Growth', neg: 'No growth', test: 'No growth', idResult: 'Confirmed' },
];

export interface MLTDocxOptions {
  dataMode?: string;
  docType?: 'protocol' | 'report';
  theme?: ThemeFormat;
  fontFamily?: string;
  fontSize?: number;
  footerSignOffData?: FooterSignOffData;
}

export async function generateAndDownloadMLTDocx(
  data: MLTDocumentData,
  options: MLTDocxOptions = { dataMode: 'TEMPLATE' }
): Promise<void> {
  const isProtocol = options.docType ? options.docType === 'protocol' : !data.reportNo;
  const docTypeTitle = isProtocol ? 'Microbial Limit Test Protocol' : 'Microbial Limit Test Report';
  const docTypeHeader = isProtocol ? 'ANALYTICAL METHOD VERIFICATION PROTOCOL' : 'ANALYTICAL METHOD VERIFICATION REPORT';
  
  // Extract or default parameters to match the authentic Westcoast PDF
  const companyName = data.companyName && !data.companyName.includes('Pharma QC Labs')
    ? data.companyName
    : 'WESTCOAST PHARMACEUTICAL WORKS LTD.';
  const productName = data.productName || 'Tibolone Tablets BP 2.5 mg';
  const batchNo = data.batchNo || 'VAL-TIB-2609665';
  const docNo = (isProtocol ? data.protocolNo : data.reportNo) || (isProtocol ? 'AMVP-TIB-2609-665' : 'AMVR-TIB-2609-665');
  const references = data.references && data.references.length > 0 ? data.references.join(', ') : 'USP <61>, USP <62>, USP <1111>';
  const dataMode = options.dataMode || 'DEMO';
  const isDemo = dataMode === 'DEMO';
  const FONT_FAMILY = options.fontFamily || 'Times New Roman';

  const cleanDocType = isProtocol ? 'AMV_Protocol' : 'AMV_Report';
  const cleanProduct = productName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanDocType}_MLT_${cleanProduct}_${docNo.replace(/\//g, '-')}.docx`;

  // Pre-load the official Westcoast rubber stamp bytes
  const stampBytes = await getWestCoastStampUint8Array();

  const blackBorder = {
    style: BorderStyle.SINGLE,
    size: 4, // 0.5 pt
    color: '000000',
  };

  const tableCellBorders = {
    top: blackBorder,
    bottom: blackBorder,
    left: blackBorder,
    right: blackBorder,
  };

  const cellMargins = {
    top: 60,
    bottom: 60,
    left: 80,
    right: 80,
  };

  const createCell = (
    text: string | number,
    widthDxa: number,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER,
    bold = false,
    fontSize = 22,
    color = '000000'
  ) => {
    return new TableCell({
      width: { size: widthDxa, type: WidthType.DXA },
      borders: tableCellBorders,
      margins: cellMargins,
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: String(text !== undefined && text !== null ? text : ' '),
              bold,
              size: fontSize,
              font: FONT_FAMILY,
              color,
            }),
          ],
        }),
      ],
    });
  };

  // 1. Running Header (identical to PDF: Company | AMV Report - Product | Doc No. ...)
  const docHeader = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: `${companyName} | ${docTypeTitle} - ${productName} | Doc No. ${docNo}`,
            size: 17, // ~8.5pt
            font: FONT_FAMILY,
            color: '666666',
          }),
        ],
      }),
    ],
  });

  // 2. Running Footer (DEMO watermark + Page X of Y)
  const docFooter = new Footer({
    children: [
      ...(isDemo
        ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 20 },
              children: [
                new TextRun({
                  text: 'DEMO / FORMAT-DEMONSTRATION ONLY — NOT FOR GMP USE',
                  size: 16,
                  bold: true,
                  font: FONT_FAMILY,
                  color: 'B45309', // Amber watermark matching PDF
                }),
              ],
            }),
          ]
        : []),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 0 },
        children: [
          new TextRun({
            text: 'Page ',
            size: 18,
            font: FONT_FAMILY,
            color: '333333',
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
            font: FONT_FAMILY,
            color: '333333',
          }),
          new TextRun({
            text: ' of ',
            size: 18,
            font: FONT_FAMILY,
            color: '333333',
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 18,
            font: FONT_FAMILY,
            color: '333333',
          }),
        ],
      }),
    ],
  });

  // 3. Metadata Table (Document No., Product Name, Batch No., References)
  const metaTable = new Table({
    width: { size: 9906, type: WidthType.DXA },
    borders: tableCellBorders,
    rows: [
      new TableRow({
        children: [
          createCell('Document No.', 3200, AlignmentType.LEFT, true, 20),
          createCell(docNo, 6706, AlignmentType.LEFT, true, 20),
        ],
      }),
      new TableRow({
        children: [
          createCell('Product Name', 3200, AlignmentType.LEFT, true, 20),
          createCell(productName, 6706, AlignmentType.LEFT, true, 20),
        ],
      }),
      new TableRow({
        children: [
          createCell('Batch No.', 3200, AlignmentType.LEFT, true, 20),
          createCell(batchNo, 6706, AlignmentType.LEFT, true, 20),
        ],
      }),
      new TableRow({
        children: [
          createCell('References', 3200, AlignmentType.LEFT, true, 20),
          createCell(references, 6706, AlignmentType.LEFT, false, 20),
        ],
      }),
    ],
  });

  // 4. Recovery Table Header Row (9 Columns, matching PDF)
  // Col widths (total = 9906 dxa):
  const recColWidths = [2006, 850, 1050, 1000, 950, 1050, 1100, 800, 1100];
  const createRecHeaderRow = () =>
    new TableRow({
      children: [
        createCell('Organism', recColWidths[0], AlignmentType.CENTER, true, 18),
        createCell('Dilution', recColWidths[1], AlignmentType.CENTER, true, 18),
        createCell('Inoculum Control', recColWidths[2], AlignmentType.CENTER, true, 18),
        createCell('Sample Control', recColWidths[3], AlignmentType.CENTER, true, 18),
        createCell('Test Plate', recColWidths[4], AlignmentType.CENTER, true, 18),
        createCell('Net Test (cfu)', recColWidths[5], AlignmentType.CENTER, true, 18),
        createCell('Recovery %', recColWidths[6], AlignmentType.CENTER, true, 18),
        createCell('Ratio', recColWidths[7], AlignmentType.CENTER, true, 18),
        createCell('Remark', recColWidths[8], AlignmentType.CENTER, true, 18),
      ],
    });

  const createRecDataRow = (item: WestcoastRecoveryItem) =>
    new TableRow({
      children: [
        createCell(item.organism, recColWidths[0], AlignmentType.LEFT, true, 18),
        createCell(item.dilution, recColWidths[1], AlignmentType.CENTER, false, 18),
        createCell(item.inoc, recColWidths[2], AlignmentType.CENTER, false, 18),
        createCell(item.samp, recColWidths[3], AlignmentType.CENTER, false, 18),
        createCell(item.test, recColWidths[4], AlignmentType.CENTER, false, 18),
        createCell(item.net, recColWidths[5], AlignmentType.CENTER, false, 18),
        createCell(item.rec, recColWidths[6], AlignmentType.CENTER, false, 18),
        createCell(item.ratio, recColWidths[7], AlignmentType.CENTER, false, 18),
        createCell(item.remark, recColWidths[8], AlignmentType.CENTER, true, 18),
      ],
    });

  // Separate Recovery Benchmark into Page 1 rows (first 3 organisms) and Page 2 rows (last 4 organisms)
  const page1RecItems = WESTCOAST_MLT_RECOVERY_BENCHMARK.slice(0, 9);
  const page2RecItems = WESTCOAST_MLT_RECOVERY_BENCHMARK.slice(9);

  const recTablePage1 = new Table({
    width: { size: 9906, type: WidthType.DXA },
    borders: tableCellBorders,
    rows: [createRecHeaderRow(), ...(page1RecItems || []).map(createRecDataRow)],
  });

  const recTablePage2 = new Table({
    width: { size: 9906, type: WidthType.DXA },
    borders: tableCellBorders,
    rows: [createRecHeaderRow(), ...(page2RecItems || []).map(createRecDataRow)],
  });

  // 5. Table 2: Suitability for Specified Micro-organisms (6 columns)
  // Col widths (total = 9906 dxa):
  const specColWidths = [2206, 2700, 1250, 1250, 1250, 1250];
  const createSpecHeaderRow = () =>
    new TableRow({
      children: [
        createCell('Organism', specColWidths[0], AlignmentType.CENTER, true, 18),
        createCell('Medium (Enrichment / Selective)', specColWidths[1], AlignmentType.CENTER, true, 18),
        createCell('Positive Control', specColWidths[2], AlignmentType.CENTER, true, 18),
        createCell('Negative Control', specColWidths[3], AlignmentType.CENTER, true, 18),
        createCell('Test Product', specColWidths[4], AlignmentType.CENTER, true, 18),
        createCell('ID Result', specColWidths[5], AlignmentType.CENTER, true, 18),
      ],
    });

  const createSpecDataRow = (item: WestcoastSpecifiedItem) =>
    new TableRow({
      children: [
        createCell(item.organism, specColWidths[0], AlignmentType.LEFT, true, 18),
        createCell(item.medium, specColWidths[1], AlignmentType.LEFT, false, 18),
        createCell(item.pos, specColWidths[2], AlignmentType.CENTER, false, 18),
        createCell(item.neg, specColWidths[3], AlignmentType.CENTER, false, 18),
        createCell(item.test, specColWidths[4], AlignmentType.CENTER, false, 18),
        createCell(item.idResult, specColWidths[5], AlignmentType.CENTER, true, 18),
      ],
    });

  const page2SpecItems = WESTCOAST_MLT_SPECIFIED_BENCHMARK.slice(0, 2);
  const page3SpecItems = WESTCOAST_MLT_SPECIFIED_BENCHMARK.slice(2);

  const specTablePage2 = new Table({
    width: { size: 9906, type: WidthType.DXA },
    borders: tableCellBorders,
    rows: [createSpecHeaderRow(), ...(page2SpecItems || []).map(createSpecDataRow)],
  });

  const specTablePage3 = new Table({
    width: { size: 9906, type: WidthType.DXA },
    borders: tableCellBorders,
    rows: [createSpecHeaderRow(), ...(page3SpecItems || []).map(createSpecDataRow)],
  });

  // 6. Sign-off table with the official rubber stamp and signatures
  const signOffTable = createDocxSignOffTable({
    fontFamily: FONT_FAMILY,
    dataMode: options.dataMode as any,
    footerData: options.footerSignOffData,
    stampImageBytes: stampBytes,
    theme: options.theme,
  });

  // Assemble the 3 pages identically to the uploaded PDF
  const docElements = [
    // ----------------------------------------------------
    // PAGE 1: Title, Metadata, Section 1, Section 2, Table 1 (first 3 organisms)
    // ----------------------------------------------------
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({
          text: companyName,
          bold: true,
          size: 28, // 14pt
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: `${docTypeHeader} (Microbial Limit Test)`,
          bold: true,
          size: 24, // 12pt
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),

    metaTable,

    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: '1. Objective and Scope',
          bold: true,
          size: 24, // 12pt
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 180 },
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: `To verify the suitability of the microbial limit test method for ${productName} in accordance with harmonized compendial requirements.`,
          size: 24, // 12pt
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),

    new Paragraph({
      spacing: { before: 180, after: 60 },
      children: [
        new TextRun({
          text: '2. Method Verification Results (Recovery)',
          bold: true,
          size: 24,
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 140 },
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: 'The following results represent the recovery of test organisms against the calculated value of the inoculum suspension. The required recovery ratio is 0.5 to 2.0.',
          size: 24,
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),

    recTablePage1,

    // Page Break between Page 1 and Page 2
    new Paragraph({
      children: [new PageBreak()],
    }),

    // ----------------------------------------------------
    // PAGE 2: Table 1 Continued, Section 3, Table 2 (first 2 organisms)
    // ----------------------------------------------------
    recTablePage2,

    new Paragraph({
      spacing: { before: 220, after: 60 },
      children: [
        new TextRun({
          text: '3. Suitability of Test Method for Specified Micro-organisms',
          bold: true,
          size: 24,
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 140 },
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: 'The following details the isolation and identification of organisms inoculated in the medium along with the material. Positive controls must show growth, and negative controls must show no growth.',
          size: 24,
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),

    specTablePage2,

    // Page Break between Page 2 and Page 3
    new Paragraph({
      children: [new PageBreak()],
    }),

    // ----------------------------------------------------
    // PAGE 3: Table 2 Continued, Section 4 Conclusion, Sign-off Table, End of Doc
    // ----------------------------------------------------
    specTablePage3,

    new Paragraph({
      spacing: { before: 220, after: 60 },
      children: [
        new TextRun({
          text: '4. Conclusion',
          bold: true,
          size: 24,
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 200 },
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: 'The analytical method is verified and found suitable for its intended purpose.',
          size: 24,
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: '— END OF DOCUMENT —',
          bold: true,
          size: 24,
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1150, bottom: 1150, left: 1150, right: 1150 },
          },
        },
        headers: {
          default: docHeader,
        },
        footers: {
          default: docFooter,
        },
        children: docElements,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
