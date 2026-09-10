const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  console.time('extract');
  const res = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: 'Extract chromatographic conditions for Vildagliptin Tablets 100 mg. Return JSON with column, mobilePhase, flowRate, wavelength, injectionVolume, columnTemperature, diluent, workingConcentration',
    config: { responseMimeType: 'application/json' }
  });
  console.timeEnd('extract');
  console.log("Result:", res.text);
}
run();
