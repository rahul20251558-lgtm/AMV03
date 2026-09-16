const fs = require('fs');
let content = fs.readFileSync('src/services/mltDocxGenerator.ts', 'utf8');

content = content.replace("TextPosition,", "");
content = content.replace(
  /alignment: AlignmentType,/g,
  "alignment: typeof AlignmentType[keyof typeof AlignmentType],"
);
// Wait, actually I can just leave `alignment: any` since it's an internal helper function.
content = content.replace(
  /alignment: AlignmentType,/g,
  "alignment: any,"
);
content = content.replace(
  /alignment: typeof AlignmentType\[keyof typeof AlignmentType\],/g,
  "alignment: any,"
);

fs.writeFileSync('src/services/mltDocxGenerator.ts', content);
