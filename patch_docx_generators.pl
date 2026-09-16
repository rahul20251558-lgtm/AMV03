use strict;
use warnings;

sub patch_file {
    my ($filename) = @_;
    open my $in, '<', $filename or die $!;
    my $content = do { local $/; <$in> };
    close $in;

    # Pass theme to createDocxSignOffFooter
    $content =~ s/stampImageBytes: stampBytes,/stampImageBytes: stampBytes,\n    theme: options.theme,/g;

    # Replace runningHeader logic in the generators
    # In amvDocxGenerator.ts and others, the runningHeader is usually created like:
    # const runningHeader = new Header({
    #   children: [
    #     new Paragraph({ ...
    # Wait, the structure is different in docx generation.

    open my $out, '>', $filename or die $!;
    print $out $content;
    close $out;
}

patch_file('src/services/amvDocxGenerator.ts');
patch_file('src/services/rsDocxGenerator.ts');
patch_file('src/services/dissolutionDocxGenerator.ts');
patch_file('src/services/mltDocxGenerator.ts');

