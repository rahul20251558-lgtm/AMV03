const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add P and F state
const stateToAdd = `
  const [potencyDecimal, setPotencyDecimal] = useState(0.9982);
  const [saltFactor, setSaltFactor] = useState(1.0000);
`;
content = content.replace(/const \[isGenerationSuccess, setIsGenerationSuccess\] = useState\(false\);/, 
  'const [isGenerationSuccess, setIsGenerationSuccess] = useState(false);\n' + stateToAdd);

// 2. Add SALT_FACTORS import
if (!content.includes('SALT_FACTORS')) {
  content = content.replace(/import \{.*?\} from '\.\/services\/mathUtils';/, 
    "import { computePctDissolved, computeAssayPct, computeImpPct, SALT_FACTORS } from './services/mathUtils';");
}

// 3. Add to handleGenerate
const genReplace = /const docTypeChoice = docType;/;
const genNew = `const docTypeChoice = docType;
    const additionalData = { potencyDecimal, saltFactor };`;
content = content.replace(genReplace, genNew);

// Add to generateDissolutionReport call in App.tsx
content = content.replace(/generateDissolutionReport\(productName, \{.*?\}/g, (match) => match.replace('}', ', potencyDecimal, saltFactor }'));
content = content.replace(/generateAssayReport\(productName, \{.*?\}/g, (match) => match.replace('}', ', potencyDecimal, saltFactor }'));
content = content.replace(/generateRSReport\(productName, \{.*?\}/g, (match) => match.replace('}', ', potencyDecimal, saltFactor }'));


// 4. Add UI Inputs for P and F
// Find the <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
const uiBlockRegex = /<div className="space-y-2">\s*<Label htmlFor="companyName".*?<\/div>/s;
const newUIBlock = `
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Site Name / Organization
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-10 text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="potency" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-600" />
                  RS Potency (P)
                </Label>
                <Input
                  id="potency"
                  type="number"
                  step="0.0001"
                  value={potencyDecimal}
                  onChange={(e) => setPotencyDecimal(parseFloat(e.target.value) || 1)}
                  className="h-10 text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saltFactor" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-purple-600" />
                  Salt-to-Base Factor (F)
                </Label>
                <select
                  id="saltFactor"
                  value={saltFactor}
                  onChange={(e) => setSaltFactor(parseFloat(e.target.value))}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={1.0000}>Free acid/base (1.0000)</option>
                  <option value={0.7239}>Amlodipine besylate (0.7239)</option>
                  <option value={0.9575}>Rosuvastatin calcium (0.9575)</option>
                  <option value={0.8663}>Metoprolol succinate (0.8663)</option>
                  <option value={0.8938}>Diltiazem HCl (0.8938)</option>
                </select>
              </div>
`;

content = content.replace(uiBlockRegex, newUIBlock);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
