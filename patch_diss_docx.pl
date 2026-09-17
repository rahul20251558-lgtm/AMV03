use strict;
use warnings;

sub patch_file {
    my ($filename) = @_;
    open my $in, '<', $filename or die $!;
    my $content = do { local $/; <$in> };
    close $in;

    my $replacement = <<'END';
  docElements.push(createSubSectionHeader('8.1 Linearity'));
  docElements.push(createBodyText('A calibration curve is a general method for determining the concentration of a substance in an unknown sample by comparing it to a set of samples of known concentration.'));
  docElements.push(createBodyText('A calibration curve is simply a graph where concentration is plotted along the x-axis, and peak area is plotted along the y-axis. After making several Calibration Standards at different concentrations. After running each one on the instrument and getting the area, the points are then plotted on the graph. The points are then connected with a line. That line represents the calibration curve.'));
  docElements.push(createBodyText('Prepare 5 or more Standard solutions having concentrations that cover the range of detection (for example, 50 %; 75 %; 100 %; 125 % and 150 % of nominal concentration).'));
  
  if (data.linearityAndRange?.linearity?.levels && data.linearityAndRange.linearity.levels.length > 0) {
    data.linearityAndRange.linearity.levels.forEach(lvl => {
      docElements.push(createBodyText(`For ${lvl.levelName} (${lvl.nominalPpm} ppm) : Weigh accurately about ${lvl.weightMg || 'the required'} mg of Reference Standard in volumetric flask, further dissolve in diluent and make up to the mark with diluent to attain ${lvl.nominalPpm} ppm.`));
    });
  }
  docElements.push(new Paragraph({ spacing: { before: 80, after: 120 } }));
END

    $content =~ s/  docElements\.push\(createSubSectionHeader\('8\.1 Linearity'\)\);\s*docElements\.push\(\s*createBodyText\(\s*'A calibration curve is a general method for determining the concentration of a substance in an unknown sample by comparing it to a set of standard solutions of known concentration\. Concentration is plotted along the x-axis and the response \(peak area\) along the y-axis; the points obtained from the calibration standards are plotted and the line through them represents the calibration curve\.'\s*\)\s*\);/\n$replacement/g;

    open my $out, '>', $filename or die $!;
    print $out $content;
    close $out;
}

patch_file('src/services/dissolutionDocxGenerator.ts');
