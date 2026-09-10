const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(model) {
  console.time(model);
  try {
    const res = await ai.models.generateContent({
      model: model,
      contents: 'Respond with JSON {"status": "ok"}',
      config: { responseMimeType: 'application/json' }
    });
    console.timeEnd(model);
    console.log(model, "SUCCESS:", res.text);
  } catch (err) {
    console.timeEnd(model);
    console.log(model, "FAILED:", err.message);
  }
}

async function run() {
  await testModel('gemini-3.6-flash');
  await testModel('gemini-2.5-flash');
  await testModel('gemini-3.8-flash');
}
run();
