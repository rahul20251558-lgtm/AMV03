const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add fpsFileData state
code = code.replace(
  'const [fpsUploaded, setFpsUploaded] = useState(false);',
  'const [fpsUploaded, setFpsUploaded] = useState(false);\n  const [fpsFileData, setFpsFileData] = useState<{ base64: string; mimeType: string } | null>(null);'
);

// 2. Update fetch bodies
code = code.replace(
  /body: JSON\.stringify\(\{\s*productName,\s*protocolNo: documentNo,\s*batchNo,\s*companyName,\s*\}\),/g,
  `body: JSON.stringify({
            productName,
            protocolNo: documentNo,
            batchNo,
            companyName,
            fpsFileData,
          }),`
);

code = code.replace(
  /body: JSON\.stringify\(\{\s*productName,\s*documentNo,\s*batchNo,\s*companyName,\s*\}\),/g,
  `body: JSON.stringify({
          productName,
          documentNo,
          batchNo,
          companyName,
          fpsFileData,
        }),`
);

// 3. Update onFpsUpload to actually read the file
const newUploadHandler = `onFpsUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              const match = result.match(/^data:(.*?);base64,(.*)$/);
              if (match) {
                setFpsFileData({ mimeType: match[1], base64: match[2] });
                setFpsUploaded(true);
              }
            };
            reader.readAsDataURL(file);
          }}`;

code = code.replace(
  /onFpsUpload=\{\(file\) => \{\s*console\.log\('Simulating FPS limits extraction from:', file\.name\);\s*setIsLoading\(true\);\s*setTimeout\(\(\) => \{\s*setFpsUploaded\(true\);\s*setIsLoading\(false\);\s*\}, 800\);\s*\}\}/g,
  newUploadHandler
);

fs.writeFileSync(file, code);
