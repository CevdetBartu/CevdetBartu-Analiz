import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Read API keys from .env directly for testing
const envContent = fs.readFileSync("./artifacts/api-server/.env", "utf-8");
const match = envContent.match(/GEMINI_API_KEY="(.*?)"/);
if (!match) {
  console.error("No API key found in .env");
  process.exit(1);
}
const apiKey = match[1];

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Merhaba, nasilsin?");
    console.log("Success! Output:", result.response.text());
  } catch (error) {
    console.error("Gemini Error:", error);
  }
}

test();
