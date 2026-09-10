const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

// Route 1: generate-amv
code = code.replace(
  'const { productName, documentNo, batchNo, companyName } = req.body;',
  'const { productName, documentNo, batchNo, companyName, fpsFileData } = req.body;'
);

code = code.replace(
  /const response = await ai\.models\.generateContent\(\{\s*model: 'gemini-3\.8-flash',\s*contents: prompt,\s*config: \{\s*responseMimeType: 'application\/json',\s*\},\s*\}\);/g,
  `const contentsParts = [];
        if (fpsFileData && fpsFileData.base64 && fpsFileData.mimeType) {
          contentsParts.push({
            inlineData: {
              data: fpsFileData.base64,
              mimeType: fpsFileData.mimeType
            }
          });
          prompt = \`[CRITICAL INSTRUCTION: A Finished Product Specification (FPS) document has been uploaded. You MUST extract the analytical method parameters (Mobile phase, column, wavelength, temperature, flow rate, injection volume, diluent, standard/sample preparation, etc.) exactly from this uploaded document and use them strictly, overriding any compendial or internal knowledge.]\\n\\n\` + prompt;
        }
        contentsParts.push({ text: prompt });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contentsParts,
          config: {
            responseMimeType: 'application/json',
          },
        });`
);

// Route 2: generate-rs-amv
code = code.replace(
  'const { productName, protocolNo, batchNo, companyName, date } = req.body;',
  'const { productName, protocolNo, batchNo, companyName, date, fpsFileData } = req.body;'
);

// We need to apply the replacement to all three places (since they all use the exact same generateContent block or similar)
// Let's do it using a regex or just let it replace globally since we used /g above!
// Oh wait, did we use /g? Yes, but the indentation might be slightly different. Let's check.
fs.writeFileSync(file, code);
