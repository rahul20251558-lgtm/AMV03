const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const [isSSOTModalOpen, setIsSSOTModalOpen] = useState(false);",
  "const [isSSOTModalOpen, setIsSSOTModalOpen] = useState(false);\n  const [auditNonce, setAuditNonce] = useState(0);"
);

fs.writeFileSync('src/App.tsx', code);
