const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Test minimal text prompt with gemini-3.6-flash
ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: 'Extract column and mobile phase from this text: "Chromatographic conditions: Column: Hypersil BDS C18 (250 x 4.6 mm, 5 um), Mobile phase: Buffer pH 3.0 : ACN (60:40)". Output JSON.',
  config: { responseMimeType: 'application/json' }
}).then(res => {
  console.log("Extraction test passed:", res.text);
}).catch(err => {
  console.error("Extraction test failed:", err);
});
