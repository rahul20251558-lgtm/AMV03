import fs from 'fs';
let code = fs.readFileSync('src/services/rsDocxGenerator.ts', 'utf8');

const startStr = "const wcSignColWidths = [1500, 2500, 2000, 2000, 1906];";
const endStr = "docElements.push(new Paragraph({ children: [new PageBreak()] }));";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + "docElements.push(new Paragraph({ children: [new PageBreak()] }));\n" + code.substring(endIndex);
    fs.writeFileSync('src/services/rsDocxGenerator.ts', code);
    console.log('Removed duplicate signoff table from Page 1.');
} else {
    console.log('Could not find signoff table to remove.');
}
