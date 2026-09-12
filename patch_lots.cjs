const fs = require('fs');

const files = [
  'src/services/dissolutionPharmaDatabase.ts',
  'src/services/pharmaDatabase.ts',
  'src/services/rsPharmaDatabase.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace lot strings
  content = content.replace(/lotNo:\s*'(.*?)'/g, "lotNo: `$1-${Math.floor(rand() * 1000).toString().padStart(3, '0')}`");
  
  // Replace equipment serials
  content = content.replace(/serialNo:\s*'(.*?)'/g, "serialNo: `$1-${Math.floor(rand() * 1000).toString().padStart(3, '0')}`");
  
  fs.writeFileSync(file, content, 'utf-8');
}
