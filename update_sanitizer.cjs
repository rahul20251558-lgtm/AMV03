const fs = require('fs');
let content = fs.readFileSync('src/services/postGenerationSanitizer.ts', 'utf8');

const mltPatch = `
  // Special MLT dates
  if (copy.analysisStartDate && copy.analysisEndDate) {
    const dEnd = new Date(parsedTarget);
    dEnd.setDate(dEnd.getDate() - 3);
    copy.analysisEndDate = formatPharmaDateHelper(dEnd);
    
    const dStart = new Date(parsedTarget);
    dStart.setDate(dStart.getDate() - 10);
    copy.analysisStartDate = formatPharmaDateHelper(dStart);
    
    const dProt = new Date(parsedTarget);
    dProt.setDate(dProt.getDate() - 20);
    copy.protocolDate = formatPharmaDateHelper(dProt);
    
    if (Array.isArray(copy.organisms)) {
      copy.organisms.forEach(org => {
        org.dateOfPreparation = formatPharmaDateHelper(dStart);
      });
    }
  }
`;

content = content.replace(
  "  // SignOffs",
  mltPatch + "\n  // SignOffs"
);

fs.writeFileSync('src/services/postGenerationSanitizer.ts', content);
