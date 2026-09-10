const fs = require('fs');
const file = 'src/services/pharmaDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/name: \`\$\{mono\.activeSubstance\} RS\`/g, "name: \`\${dynamicActiveSubstance} RS\`");
code = code.replace(/quantification of \$\{mono\.activeSubstance\}/g, "quantification of \${dynamicActiveSubstance}");
code = code.replace(/Assay by HPLC \(\$\{mono\.activeSubstance\} content\)/g, "Assay by HPLC (\${dynamicActiveSubstance} content)");
code = code.replace(/observed at \$\{mono\.activeSubstance\} retention time/g, "observed at \${dynamicActiveSubstance} retention time");

fs.writeFileSync(file, code);
