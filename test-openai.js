require('dotenv').config({ path: '.env' });
const { OpenAI } = require('openai');

async function test() {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "Say hello" }],
        model: "gpt-4o-mini",
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
