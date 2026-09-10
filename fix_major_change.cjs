const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The error is because isMajorChangeJustificationNeeded is not defined.
// Let's add the state definition for it if it's missing, or maybe it's just a variable.

const stateDef = `  const [isMajorChangeJustificationNeeded, setIsMajorChangeJustificationNeeded] = useState(false);`;

code = code.replace("  const [isMajorChangeModalOpen, setIsMajorChangeModalOpen] = useState(false);", 
  "  const [isMajorChangeModalOpen, setIsMajorChangeModalOpen] = useState(false);\n" + stateDef);

fs.writeFileSync('src/App.tsx', code);
