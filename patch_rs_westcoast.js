const fs = require('fs');
const file = 'src/services/rsDocxGenerator.ts';
let code = fs.readFileSync(file, 'utf8');

// Insert isWestcoast variable
code = code.replace(
  "const isBlue = theme === 'blue';",
  "const isBlue = theme === 'blue';\n  const isWestcoast = theme === 'westcoast';"
);

// We want to completely replace the metadata and sign-off portion on Page 1 if isWestcoast
// Find where Page 1 starts
const p1Start = code.indexOf("// ================= PAGE 1 =================");
const p1End = code.indexOf("// ================= PAGE 2 =================");

if (p1Start === -1) {
    console.log("Could not find Page 1");
    process.exit(1);
}

// Wait, the existing file doesn't have "// ================= PAGE 2 ================="
