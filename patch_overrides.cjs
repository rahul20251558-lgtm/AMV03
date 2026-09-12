const fs = require('fs');

const files = [
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Add potencyDecimal and saltFactor to overrides interface
  content = content.replace(/targetApi\?: string;/, "targetApi?: string;\n    potencyDecimal?: number;\n    saltFactor?: number;");
  
  // Also pass them to the global seed
  content = content.replace(/const seed = \{[\s\S]*?productName:/, (match) => match.replace('productName:', 'potencyDecimal: overrides?.potencyDecimal || 1.0,\n    saltFactor: overrides?.saltFactor || 1.0,\n    productName:'));
  
  // Replace the P and F fallback
  content = content.replace(/const P = mono\.potencyDecimal \|\| [0-9.]+;/g, "const P = overrides?.potencyDecimal || 0.998;");
  content = content.replace(/const F = mono\.saltFactor \|\| [0-9.]+;/g, "const F = overrides?.saltFactor || 1.0;");

  fs.writeFileSync(file, content, 'utf-8');
}

// In App.tsx, we did match.replace('}', ', potencyDecimal, saltFactor }') 
// Let's ensure App.tsx has these fields passed properly in handleGenerate.
