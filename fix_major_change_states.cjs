const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const statesToInsert = `
  const [isMajorChangeModalOpen, setIsMajorChangeModalOpen] = useState(false);
  const [isMajorChangeJustificationNeeded, setIsMajorChangeJustificationNeeded] = useState(false);
`;

code = code.replace(
  '  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);',
  '  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);' + statesToInsert
);

fs.writeFileSync('src/App.tsx', code);
