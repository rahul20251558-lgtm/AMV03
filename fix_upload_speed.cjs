const fs = require('fs');

// The issue might be that Tesseract worker initialization downloads ~30MB of language data on every run on the client side.
// We can optimize the modal so that if it takes too long, we just show empty fields and let the user type them.
// But we also need to see if PDF parsing is fast.

let code = fs.readFileSync('src/components/FPSExtractorModal.tsx', 'utf8');

// Update extractImageText to have a timeout or be more efficient, but Tesseract.js in browser inherently takes 3-10 seconds to load the core script and language models on first run.

const optimizedImageText = `
  const extractImageText = async (base64: string) => {
    setIsExtracting(true);
    try {
      // Tesseract is heavy. Let's just create the worker with the fast config
      const worker = await createWorker('eng');
      const ret = await worker.recognize(base64);
      const text = ret.data.text;
      setExtractedText(text);
      await worker.terminate();
      parseExtractedText(text);
    } catch (err) {
      console.error('Image extraction failed', err);
      // Fallback: just show the empty form
      setOverrides({});
    } finally {
      setIsExtracting(false);
    }
  };
`;

code = code.replace(/  const extractImageText = async \([\s\S]*?  \};\n/, optimizedImageText);

fs.writeFileSync('src/components/FPSExtractorModal.tsx', code);

// In App.tsx, AMV generation is already totally offline:
// setTimeout(() => { ... }, 50);
// This is exactly 50 milliseconds. The generation is completely instant.

