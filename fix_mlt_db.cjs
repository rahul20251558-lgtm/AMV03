const fs = require('fs');
let content = fs.readFileSync('src/services/mltPharmaDatabase.ts', 'utf-8');

// Replace the suitabilityRows building block
const blockToReplaceRegex = /const suitabilityRows: MLTSuitabilityRow\[\] = \[\];[\s\S]*?\}\);/m;

const newBlock = `
  // Section 6: Neutraliser Screening (using S. aureus as worst case indicator for Tween 20)
  const neutralizerLevels = ['0.025 %', '0.050 %', '0.075 %', '0.1 %'];
  const suitabilityRows = neutralizerLevels.map((level, i) => {
    // Make only 0.1% pass
    let ratioTarget = 0.4 + (i * 0.1); 
    if (i === 3) ratioTarget = 0.85; // Pass
    const inoc = Math.floor(60 + rand() * 30);
    const net = Math.floor(inoc * ratioTarget);
    const samp = Math.floor(rand() * 2);
    const test = net + samp;
    return {
      organismId: organisms[0].id, // Any organism works, S. aureus is standard
      neutralizer: 'Tween 20',
      neutralizerLevel: level,
      testPlate1: test,
      testPlate2: test,
      sampleControl1: samp,
      sampleControl2: samp,
      inoculumControl1: inoc,
      inoculumControl2: inoc
    };
  });

  // Section 7: Recovery at 3 dilutions
  const dilutions = ['1:10', '1:50', '1:100'];
  const recoveryRows: any[] = [];
  organisms.forEach(org => {
    dilutions.forEach(dil => {
      // ratio between 0.7 and 1.2
      const ratioTarget = 0.75 + rand() * 0.4;
      const inoc = Math.floor(70 + rand() * 25);
      const net = Math.floor(inoc * ratioTarget);
      const samp = Math.floor(rand() * 2);
      const test = net + samp;
      recoveryRows.push({
        organismId: org.id,
        dilution: dil,
        inoculumControl1: inoc,
        inoculumControl2: inoc + (Math.floor(rand()*5)-2),
        sampleControl1: samp,
        sampleControl2: samp,
        testPlate1: test,
        testPlate2: test + (Math.floor(rand()*5)-2)
      });
    });
  });
`;

if (blockToReplaceRegex.test(content)) {
  content = content.replace(blockToReplaceRegex, newBlock);
} else {
  console.log("Regex did not match");
}

fs.writeFileSync('src/services/mltPharmaDatabase.ts', content, 'utf-8');
