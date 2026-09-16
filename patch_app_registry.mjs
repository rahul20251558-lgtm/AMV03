import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { RegistryScreen }')) {
  code = code.replace(/import \{ Header \} from '.\/components\/Header';/, "import { Header } from './components/Header';\nimport { RegistryScreen } from './components/RegistryScreen';\nimport { validateRegistryBeforeGeneration, addRegistryEntry } from './services/registry';");
}

code = code.replace(/const \[isSSOTModalOpen, setIsSSOTModalOpen\] = useState\(false\);/, "const [isSSOTModalOpen, setIsSSOTModalOpen] = useState(false);\n  const [isRegistryOpen, setIsRegistryOpen] = useState(false);");

code = code.replace(/<Header[\s\S]*?onOpenPromptModal=\{/, (match) => {
  return match.replace('onOpenPromptModal={', 'onOpenRegistry={() => setIsRegistryOpen(true)}\n          onOpenPromptModal={');
});

code = code.replace('{/* Master System Prompt & User Input Template Modal (§10) */}', '{isRegistryOpen && <RegistryScreen onClose={() => setIsRegistryOpen(false)} />}\n      {/* Master System Prompt & User Input Template Modal (§10) */}');

fs.writeFileSync('src/App.tsx', code);
