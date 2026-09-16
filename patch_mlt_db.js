const fs = require('fs');
let code = fs.readFileSync('src/services/mltPharmaDatabase.ts', 'utf8');

const regex = /const suitabilityRows = neutralizerLevels\.map.*?const specifiedOrganismRows: MLTSpecifiedOrganismRow\[\] = organisms/s;
if (!regex.test(code)) {
    console.log("NOT FOUND!");
} else {
    console.log("FOUND!");
}
