for file in src/components/AMVDocumentViewer.tsx src/components/RSAMVDocumentViewer.tsx src/components/DissolutionDocumentViewer.tsx; do
  sed -i 's/const isBlue = theme === '\''blue'\'';/const isBlue = theme === '\''blue'\'';\n  const isWestcoast = theme === '\''westcoast'\'';/g' $file
done
