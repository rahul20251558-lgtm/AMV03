import fs from 'fs';
let code = fs.readFileSync('src/services/docxSignOffFooter.ts', 'utf8');

code = code.replace(
  "export interface CreateDocxSignOffFooterOptions {",
  "export interface CreateDocxSignOffFooterOptions {\n  theme?: string;"
);

// If theme === 'westcoast', create the specific Westcoast footer table.
// Otherwise, keep the standard empty one.

const oldCreateSignOffTable = `export function createDocxSignOffTable(options: CreateDocxSignOffFooterOptions): Table {
  // We no longer return the big sign-off table. We return an empty paragraph 
  // disguised as a table (or just an invisible table) to avoid breaking dependents 
  // that still append it to their sections.
  return new Table({
    width: { size: 0, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [],
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            }
          })
        ]
      })
    ]
  });
}`;

const newCreateSignOffTable = `export function createDocxSignOffTable(options: CreateDocxSignOffFooterOptions): Table {
  const isWestcoast = options.theme === 'westcoast';
  
  if (!isWestcoast) {
    return new Table({
      width: { size: 0, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [],
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              }
            })
          ]
        })
      ]
    });
  }

  // Westcoast PDF Footer Table
  const FONT_FAMILY = options.fontFamily || 'Times New Roman';
  const data = options.footerData || DEFAULT_FOOTER_SIGN_OFF_DATA;
  
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  };

  const createCell = (text: string, colSpan = 1, align = AlignmentType.CENTER, width?: number) => {
    return new TableCell({
      columnSpan: colSpan,
      borders: cellBorder,
      width: width ? { size: width, type: WidthType.DXA } : undefined,
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text,
              size: 20,
              font: FONT_FAMILY,
              color: '000000',
            })
          ]
        })
      ]
    });
  };

  return new Table({
    width: { size: 9906, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          createCell('', 1, AlignmentType.CENTER, 1980),
          createCell('Prepared By', 1, AlignmentType.CENTER, 1981),
          createCell('Checked By', 1, AlignmentType.CENTER, 1981),
          createCell('Approved By', 2, AlignmentType.CENTER, 3964),
        ]
      }),
      new TableRow({
        children: [
          createCell('Signature', 1),
          createCell('', 1),
          createCell('', 1),
          createCell('', 1, AlignmentType.CENTER, 1982),
          createCell('', 1, AlignmentType.CENTER, 1982),
        ]
      }),
      new TableRow({
        children: [
          createCell('Date', 1),
          createCell(data.preparedBy.date || '11/02/2024', 1),
          createCell(data.checkedBy.date || '11/02/2024', 1),
          createCell(data.qaInCharge.date || '11/02/2024', 1),
          createCell(data.plantHead.date || '11/02/2024', 1),
        ]
      }),
      new TableRow({
        children: [
          createCell('Designation', 1),
          createCell(data.preparedBy.designation || 'QC. Chemist', 1),
          createCell(data.checkedBy.designation || 'QC. In-charge', 1),
          createCell(data.qaInCharge.designation || 'QA In-charge', 1),
          createCell(data.plantHead.designation || 'Plant Head', 1),
        ]
      }),
    ]
  });
}`;

code = code.replace(oldCreateSignOffTable.trim(), newCreateSignOffTable.trim());

const oldBottomMeta = `
  // Bottom line: Page X of Y (Left) and WC/QC/01/0F01 (Right)
  const bottomMetaTable = new Table({
    width: { size: 9906, type: WidthType.DXA },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 4953, type: WidthType.DXA },
            borders: noBorders,
            margins: { top: 40, bottom: 0, left: 0, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                    font: FONT_FAMILY,
                    bold: true,
                    color: '000000',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    font: FONT_FAMILY,
                    bold: true,
                    color: '000000',
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    font: FONT_FAMILY,
                    bold: true,
                    color: '000000',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    font: FONT_FAMILY,
                    bold: true,
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 4953, type: WidthType.DXA },
            borders: noBorders,
            margins: { top: 40, bottom: 0, left: 0, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: data.formatNo || 'WC/QC/01/0F01',
                    size: 16,
                    font: FONT_FAMILY,
                    bold: true,
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
`;

// wait, the old createDocxSignOffFooter in docxSignOffFooter.ts does not have bottomMetaTable anymore!
// I changed it earlier to only have the DEMO and Page number, no table!
