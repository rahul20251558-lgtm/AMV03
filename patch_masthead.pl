use strict;
use warnings;

sub patch_file {
    my ($filename) = @_;
    open my $in, '<', $filename or die $!;
    my $content = do { local $/; <$in> };
    close $in;

    # Replace Company Title through Document Title
    $content =~ s/\{\/\* Company Title \*\/\}[\s\S]*?\{\/\* Metadata Table \*\/\}/\{isWestcoast \? \(\n          <div className="text-center pb-6 pt-2">\n            <h1 className="text-[14pt] font-bold uppercase tracking-wider mb-2 text-black">\n              \{isProtocol \? 'ANALYTICAL METHOD VALIDATION PROTOCOL' : 'ANALYTICAL METHOD VALIDATION REPORT'\}\n            <\/h1>\n            <h2 className="text-[12pt] font-bold uppercase tracking-wide text-black">\n              \{data.companyName\}\n            <\/h2>\n            \{dataMode === 'DEMO' && \(\n              <div className="inline-block mt-4 px-3 py-1 bg-amber-100 border border-amber-300 rounded text-amber-900 font-bold text-xs tracking-wider uppercase">\n                DEMO \/ FORMAT-DEMONSTRATION ONLY — NOT FOR GMP USE\n              <\/div>\n            \)\}\n          <\/div>\n        \) : \(\n          <>\n            \{\/\* Company Title \*\/\}\n            <div className="text-center pb-1 pt-1">\n              <h1 className=\{\`text-xl sm:text-2xl font-bold uppercase tracking-wide \$\{sectionHeadingClass\}\`\}>\n                \{data.companyName\}\n              <\/h1>\n              <p className="text-xs text-zinc-600 font-medium mt-1">\{data.companyAddress\}<\/p>\n            <\/div>\n\n            \{\/\* Solid Divider Line \*\/\}\n            <div className=\{\`w-full h-1 my-3 \$\{isBlue \? 'bg-[#1F4E79]' : 'bg-zinc-800'\}\`\}><\/div>\n\n            \{\/\* Document Title \*\/\}\n            <div className="text-center py-1 mb-3">\n              <h2 className=\{\`text-sm sm:text-base font-bold uppercase tracking-wider \$\{sectionHeadingClass\}\`\}>\n                \{isProtocol\n                  \? 'ANALYTICAL METHOD VALIDATION PROTOCOL'\n                  : 'ANALYTICAL METHOD VALIDATION REPORT'\}\n              <\/h2>\n              \{dataMode === 'DEMO' && \(\n                <div className="inline-block mt-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded text-amber-900 font-bold text-xs tracking-wider uppercase">\n                  DEMO \/ FORMAT-DEMONSTRATION ONLY — NOT FOR GMP USE\n                <\/div>\n              \)\}\n            <\/div>\n          <\/>\n        \)\}\n\n        \{\/\* Metadata Table \*\/\}/;

    # Replace Metadata Table classes
    $content =~ s/<table className="w-full text-xs border-collapse border border-zinc-300">/<table className={`w-full \$\{isWestcoast \? 'text-[11pt]' : 'text-xs'\} border-collapse border border-zinc-300`}>/;
    $content =~ s/className="w-1\/3 bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700"/className={`w-1\/3 \$\{isWestcoast \? 'text-black' : 'bg-zinc-50 text-zinc-700'\} font-bold border border-zinc-300 px-3 py-1.5`}/g;
    $content =~ s/className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700"/className={`\$\{isWestcoast \? 'text-black' : 'bg-zinc-50 text-zinc-700'\} font-bold border border-zinc-300 px-3 py-1.5`}/g;

    open my $out, '>', $filename or die $!;
    print $out $content;
    close $out;
}

patch_file('src/components/AMVDocumentViewer.tsx');
patch_file('src/components/RSAMVDocumentViewer.tsx');
patch_file('src/components/DissolutionDocumentViewer.tsx');

