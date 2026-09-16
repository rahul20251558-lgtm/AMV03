use strict;
use warnings;

sub patch_file {
    my ($filename) = @_;
    open my $in, '<', $filename or die $!;
    my $content = do { local $/; <$in> };
    close $in;

    $content =~ s/createCell\('', 1/createCell(' ', 1/g;

    open my $out, '>', $filename or die $!;
    print $out $content;
    close $out;
}

patch_file('src/services/docxSignOffFooter.ts');
