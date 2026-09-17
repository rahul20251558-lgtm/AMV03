use strict;
use warnings;

sub patch_file {
    my ($filename) = @_;
    open my $in, '<', $filename or die $!;
    my $content = do { local $/; <$in> };
    close $in;

    my $replacement = <<'END';
    createSectionHeader('8. LINEARITY AND RANGE', 40, 50),
    createSubSectionHeader('8.1 Linearity', 40, 40),
    createBodyParagraph('A calibration curve is a general method for determining the concentration of a substance in an unknown sample by comparing it to a set of samples of known concentration.'),
    createBodyParagraph('A calibration curve is simply a graph where concentration is plotted along the x-axis, and peak area is plotted along the y-axis. After making several Calibration Standards at different concentrations. After running each one on the instrument and getting the area, the points are then plotted on the graph. The points are then connected with a line. That line represents the calibration curve.'),
    createBodyParagraph('Prepare 5 or more Standard solutions having concentrations that cover the range of detection (for example, 50 %; 75 %; 100 %; 125 % and 150 % of nominal concentration).'),
    ...(data.linearityAndRange?.linearityLevels && data.linearityAndRange.linearityLevels.length > 0 ? data.linearityAndRange.linearityLevels.map(lvl => 
      createBodyParagraph(`For ${lvl.levelName} (${lvl.nominalPpm} ppm) : Weigh accurately about ${lvl.weightTakenMg || 'the required'} mg of Reference Standard in volumetric flask, further dissolve in diluent and make up to the mark with diluent to attain ${lvl.nominalPpm} ppm.`)
    ) : []),
    new Paragraph({ spacing: { before: 120, after: 120 } })
  );
END

    $content =~ s/\s*createSectionHeader\('8\. LINEARITY AND RANGE', 40, 50\),\s*createSubSectionHeader\('8\.1 Linearity', 40, 40\)\s*\);/\n$replacement/g;

    open my $out, '>', $filename or die $!;
    print $out $content;
    close $out;
}

patch_file('src/services/rsDocxGenerator.ts');
