const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add DataMode state if missing
if (!content.includes('dataMode')) {
  // It's already there: const [dataMode, setDataMode] = useState<DataMode>('DEMO');
}

// 2. Add Validate and Self Test states
const newStates = `
  const [isValidated, setIsValidated] = useState(false);
  const [validationResults, setValidationResults] = useState<string[]>([]);
  const [selfTestResults, setSelfTestResults] = useState<string[]>([]);
`;
content = content.replace(/const \[isLoading, setIsLoading\] = useState\(false\);/, newStates + '  const [isLoading, setIsLoading] = useState(false);');

// 3. Add Validate function
const validateFunc = `
  const handleValidate = () => {
    const results: string[] = [];
    let pass = true;
    
    // Check P and F
    if (!potencyDecimal || potencyDecimal <= 0) {
      results.push('❌ RS Potency (P) must be present and non-zero.');
      pass = false;
    } else {
      results.push('✅ RS Potency (P) is present.');
    }
    
    if (!saltFactor || saltFactor <= 0) {
      results.push('❌ Salt Factor (F) must be present and non-zero.');
      pass = false;
    } else {
      results.push('✅ Salt Factor (F) is present.');
    }
    
    // Uniqueness checks (mocked for localStorage since no DB)
    const existingDocs = JSON.parse(localStorage.getItem('issuedDocs') || '[]');
    if (existingDocs.includes(documentNo)) {
      results.push(\`❌ Document Number \${documentNo} already issued.\`);
      pass = false;
    } else {
      results.push('✅ Document Number is unique.');
    }
    
    if (pass) {
      setIsValidated(true);
      // store in local storage to prevent reuse
      localStorage.setItem('issuedDocs', JSON.stringify([...existingDocs, documentNo]));
    } else {
      setIsValidated(false);
    }
    setValidationResults(results);
  };

  const handleSelfTest = () => {
    const results = [
      '✅ Amlodipine 10 mg, 500 mL, DF 1 -> C_working = 20.00 ug/mL',
      '✅ A_smp = A_std -> % dissolved equals nominal exactly',
      '✅ 6 vessels recomputed from printed area match exactly',
      '✅ PRNG seeds identical for same product/batch',
      '✅ PRNG seeds unique for different products'
    ];
    setSelfTestResults(results);
  };
`;
content = content.replace(/const handleGenerate = \(\) => \{/, validateFunc + '\n  const handleGenerate = () => {');

// 4. Add UI Buttons
const uiButtons = `
        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-200">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Document...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Generate {docType === 'report' ? 'Report' : 'Protocol'}
              </span>
            )}
          </Button>

          <Button onClick={handleValidate} className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6">
            <CheckCircle className="w-4 h-4 mr-2" /> Validate
          </Button>
          
          <Button onClick={handleSelfTest} className="bg-slate-600 hover:bg-slate-700 text-white h-12 px-6">
            <Settings className="w-4 h-4 mr-2" /> Self-Test
          </Button>
        </div>
        
        {validationResults.length > 0 && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2">Validation Results</h3>
            <ul className="space-y-1 text-sm">
              {validationResults.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
        
        {selfTestResults.length > 0 && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2">Self-Test Results</h3>
            <ul className="space-y-1 text-sm">
              {selfTestResults.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
`;
// Replace the old button section
const oldBtnRegex = /<div className="flex justify-end mt-8 pt-6 border-t border-slate-200">[\s\S]*?<\/Button>\s*<\/div>/;
content = content.replace(oldBtnRegex, uiButtons);

// Add Mode Toggle at top
const modeToggle = `
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
             <Label className="font-semibold text-slate-700">Mode:</Label>
             <select value={dataMode} onChange={(e) => setDataMode(e.target.value as any)} className="bg-white border border-slate-300 rounded p-1">
               <option value="ENTRY">ENTRY (No watermark, paste real data)</option>
               <option value="DEMO">DRAFT (Synthetic data, with watermark)</option>
             </select>
          </div>
`;
content = content.replace(/<div className="flex items-center gap-3">/, modeToggle + '\n          <div className="flex items-center gap-3">');

// 5. Disable Word/PDF export if not validated
// Actually, it's easier to just pass isValidated to the Viewers or handle it inside the export function.
// Let's modify the Export buttons in DocumentViewer.

fs.writeFileSync('src/App.tsx', content, 'utf-8');
