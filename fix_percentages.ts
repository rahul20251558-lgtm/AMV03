import fs from 'fs';

const files = [
  'src/components/RSAMVDocumentViewer.tsx',
  'src/components/AMVDocumentViewer.tsx',
  'src/components/DissolutionDocumentViewer.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Add a renderVal helper at the top of the component if not exists
  if (!content.includes('const renderPct')) {
    content = content.replace(
      'const isProtocol = docType === \'protocol\';',
      `const isProtocol = docType === 'protocol';\n  const renderPct = (val: any) => (val === undefined || val === null || val === '—' || val === '' || Number.isNaN(Number(val))) ? '—' : \`\${val} %\`;`
    );
    content = content.replace(
      'const isProtocol = activeDocType === \'protocol\';',
      `const isProtocol = activeDocType === 'protocol';\n  const renderPct = (val: any) => (val === undefined || val === null || val === '—' || val === '' || Number.isNaN(Number(val))) ? '—' : \`\${val} %\`;`
    );
  }
  
  // Replace simple `${var} %`
  content = content.replace(/\$\{([^}]+)\}\s*%/g, (match, p1) => {
    // If it's already a renderPct call, skip
    if (p1.includes('renderPct')) return match;
    // If it's inside a complex expression, we might need to be careful, but p1 is the variable
    return `\${renderPct(${p1})}`;
  });
  
  fs.writeFileSync(file, content);
}
