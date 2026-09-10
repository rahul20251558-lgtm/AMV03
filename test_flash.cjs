const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: 'Ping. Output JSON {"status":"ok"}',
  config: { responseMimeType: 'application/json' }
}).then(r => console.log("gemini-3.6-flash succeeded:", r.text))
  .catch(e => console.error("gemini-3.6-flash failed:", e.message));
