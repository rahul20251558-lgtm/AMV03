use strict;
use warnings;

sub patch_file {
    my ($filename) = @_;
    open my $in, '<', $filename or die $!;
    my $content = do { local $/; <$in> };
    close $in;

    $content =~ s/<h3 className="text-xs font-bold text-zinc-800 mb-1">8\.1 Linearity \(5 Levels: 50% to 150%\)<\/h3>/<h3 className="text-xs font-bold text-zinc-800 mb-1">8.1 Linearity (5 Levels: 50% to 150%)<\/h3>
          <div className="text-xs text-zinc-800 mb-3 space-y-2 leading-relaxed">
            <p>
              A calibration curve is a general method for determining the concentration of a substance in an unknown sample by comparing it to a set of samples of known concentration.
            <\/p>
            <p>
              A calibration curve is simply a graph where concentration is plotted along the x-axis, and peak area is plotted along the y-axis. After making several Calibration Standards at different concentrations. After running each one on the instrument and getting the area, the points are then plotted on the graph. The points are then connected with a line. That line represents the calibration curve.
            <\/p>
            <p>
              Prepare 5 or more Standard solutions having concentrations that cover the range of detection (for example, 50 %; 75 %; 100 %; 125 % and 150 % of nominal concentration).
            <\/p>
            {data.linearityAndRange?.linearityLevels && data.linearityAndRange.linearityLevels.length > 0 && (
              <ul className="list-none space-y-1 mt-2">
                {data.linearityAndRange.linearityLevels.map((lvl, idx) => (
                  <li key={idx}>
                    <strong>For {lvl.levelName} ({lvl.nominalPpm} ppm) :<\/strong> Weigh accurately about {lvl.weightTakenMg || 'the required'} mg of Reference Standard in volumetric flask, further dissolve in diluent and make up to the mark with diluent to attain {lvl.nominalPpm} ppm.
                  <\/li>
                ))}
              <\/ul>
            )}
          <\/div>/;

    open my $out, '>', $filename or die $!;
    print $out $content;
    close $out;
}

patch_file('src/components/RSAMVDocumentViewer.tsx');
