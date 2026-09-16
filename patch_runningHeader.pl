use strict;
use warnings;

sub patch_file {
    my ($filename, $replacement) = @_;
    open my $in, '<', $filename or die $!;
    my $content = do { local $/; <$in> };
    close $in;

    $content =~ s/const (R|r)unningHeader = (\(\) => )?\([\s\S]*?\);\n/$replacement/g;

    open my $out, '>', $filename or die $!;
    print $out $content;
    close $out;
}

my $amv_rep = <<'END';
const RunningHeader = () => (
  isWestcoast ? (
    <div className="text-center font-bold text-[12pt] mb-4 uppercase tracking-wider">
      ANALYTICAL METHOD VALIDATION REPORT
    </div>
  ) : (
    <div className="flex justify-between items-center pb-2 mb-4 border-b border-zinc-300 text-[11px] text-zinc-500 font-sans">
      <span className="font-semibold text-zinc-700">{data.companyName}</span>
      <span>
        {isProtocol ? 'AMV Protocol' : 'AMV Report'} – {data.productName} | Doc No. {data.documentNo}
      </span>
    </div>
  )
);
END

patch_file('src/components/AMVDocumentViewer.tsx', $amv_rep);

my $rs_rep = <<'END';
const runningHeader = (
  isWestcoast ? (
    <div className="text-center font-bold text-[12pt] mb-4 uppercase tracking-wider">
      ANALYTICAL METHOD VALIDATION REPORT
    </div>
  ) : (
    <div className="flex justify-between items-center pb-2 mb-4 border-b border-zinc-300 text-[11px] text-zinc-500 font-sans">
      <span className="font-semibold text-zinc-700">{data.companyName}</span>
      <span>
        {isProtocol ? 'AMV Protocol' : 'AMV Report'} (Related Substances) – {data.productName} | Doc No. {data.protocolNo}
      </span>
    </div>
  )
);
END

patch_file('src/components/RSAMVDocumentViewer.tsx', $rs_rep);

my $disso_rep = <<'END';
const runningHeader = (
  isWestcoast ? (
    <div className="text-center font-bold text-[12pt] mb-4 uppercase tracking-wider">
      ANALYTICAL METHOD VALIDATION REPORT
    </div>
  ) : (
    <div className="flex justify-between items-center pb-2 mb-4 border-b border-zinc-300 text-[0.85em] text-zinc-500">
      <span className="font-semibold text-zinc-700">{data.companyName}</span>
      <span>
        {isProtocol ? 'AMV Protocol' : 'AMV Report'} (Dissolution Method) – {data.productName} | Doc No. {data.protocolNo}
      </span>
    </div>
  )
);
END

patch_file('src/components/DissolutionDocumentViewer.tsx', $disso_rep);
