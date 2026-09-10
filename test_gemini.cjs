const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  console.time('call');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with JSON {"status": "ok", "time": "instant"}',
      config: { responseMimeType: 'application/json' }
    });
    console.timeEnd('call');
    console.log("Response:", response.text);
  } catch (err) {
    console.timeEnd('call');
    console.error("Error:", err.message);
  }
}

test();
