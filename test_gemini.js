const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyB_LhaV6hu7Q-L3b-1H5-wQyIdaYkEvxfc");

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch(e) {
    console.error("ERROR:");
    console.error(e);
  }
}
test();
