use strict;
use warnings;

sub patch_file {
    my ($filename) = @_;
    open my $in, '<', $filename or die $!;
    my $content = do { local $/; <$in> };
    close $in;

    # Inject isWestcoast variable
    $content =~ s/const isBlue = theme === 'blue';/const isBlue = theme === 'blue';\n  const isWestcoast = theme === 'westcoast';/g;

    # Fix the runningHeader
    $content =~ s/const runningHeader = new Header\(\{[\s\S]*?\}\);/const runningHeader = new Header({
    children: [
      new Paragraph({
        alignment: isWestcoast ? AlignmentType.CENTER : AlignmentType.RIGHT,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: isWestcoast ? 'ANALYTICAL METHOD VALIDATION REPORT' : \`\$\{data.companyName\}  |  \$\{isProtocol ? 'AMV Protocol' : 'AMV Report'\} – \$\{data.productName\}  |  Doc No. \$\{singleDocNumber\}\`,
            size: 24,
            bold: isWestcoast,
            font: FONT_FAMILY,
            color: isWestcoast ? '000000' : '6B7280',
          }),
        ],
      }),
    ],
  });/g;

    # Fix the masthead (page1 company title)
    $content =~ s/const page1Company = new Paragraph\(\{[\s\S]*?\}\);/const page1Company = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 20, after: isWestcoast ? 60 : 20 },
    children: [
      new TextRun({
        text: isWestcoast ? (isProtocol ? 'ANALYTICAL METHOD VALIDATION PROTOCOL' : 'ANALYTICAL METHOD VALIDATION REPORT') : data.companyName,
        bold: true,
        size: isWestcoast ? 28 : 28,
        font: FONT_FAMILY,
        color: isWestcoast ? '000000' : navyTextColor,
      }),
    ],
  });/g;

  $content =~ s/const page1Address = new Paragraph\(\{[\s\S]*?\}\);/const page1Address = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [
      new TextRun({
        text: isWestcoast ? data.companyName : data.companyAddress,
        size: isWestcoast ? 24 : 20,
        bold: isWestcoast,
        font: FONT_FAMILY,
        color: isWestcoast ? '000000' : '4B5563',
      }),
    ],
  });/g;

  $content =~ s/const page1DocTitle = new Paragraph\(\{[\s\S]*?\}\);/const page1DocTitle = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 100 },
    children: isWestcoast ? [] : [
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
  });/g;

    open my $out, '>', $filename or die $!;
    print $out $content;
    close $out;
}

patch_file('src/services/amvDocxGenerator.ts');
patch_file('src/services/rsDocxGenerator.ts');
patch_file('src/services/dissolutionDocxGenerator.ts');
patch_file('src/services/mltDocxGenerator.ts');

