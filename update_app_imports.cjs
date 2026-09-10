const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('FPSExtractorModal')) {
  code = code.replace(
    "import { AMVInputForm } from './components/AMVInputForm';",
    "import { AMVInputForm } from './components/AMVInputForm';\nimport { FPSExtractorModal, FPSOverrides } from './components/FPSExtractorModal';"
  );
  
  // Add state
  code = code.replace(
    "const [fpsFileData, setFpsFileData] = useState<{ base64: string; mimeType: string } | null>(null);",
    "const [fpsFileData, setFpsFileData] = useState<{ base64: string; mimeType: string } | null>(null);\n  const [isFpsModalOpen, setIsFpsModalOpen] = useState(false);\n  const [fpsOverrides, setFpsOverrides] = useState<FPSOverrides | null>(null);"
  );
  
  // Render Modal
  const modalComponent = `
      <FPSExtractorModal 
        isOpen={isFpsModalOpen} 
        onClose={() => setIsFpsModalOpen(false)} 
        fileData={fpsFileData} 
        validationMethod={validationMethod}
        onConfirm={(overrides) => {
          setFpsOverrides(overrides);
          setFpsUploaded(true);
          setIsFpsModalOpen(false);
        }}
      />
  `;
  
  code = code.replace(
    "</Layout>",
    modalComponent + "\n    </Layout>"
  );
  
  // Change onFpsUpload to open modal
  const newUploadHandler = `onFpsUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              const match = result.match(/^data:(.*?);base64,(.*)$/);
              if (match) {
                setFpsFileData({ mimeType: match[1], base64: match[2] });
                setIsFpsModalOpen(true);
              }
            };
            reader.readAsDataURL(file);
          }}`;

  code = code.replace(/onFpsUpload=\{\(file\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*\}\}/, newUploadHandler);
  
  // Also pass fpsOverrides to the local builder functions!
  code = code.replace(
    "const localDiss = buildFullDissolutionAMVData(productName, {",
    "const localDiss = buildFullDissolutionAMVData(productName, {\n        verifiedMonograph: fpsOverrides ? { ...fpsOverrides, medium: fpsOverrides.diluent, paddleSpeed: '', qLimit: '', apparatus: '', samplingTime: '' } : undefined,"
  );
  
  code = code.replace(
    "const localRS = buildFullRSAMVData(productName, {",
    "const localRS = buildFullRSAMVData(productName, {\n        verifiedMonograph: fpsOverrides ? fpsOverrides : undefined,"
  );
  
  fs.writeFileSync(file, code);
  console.log('updated');
}
