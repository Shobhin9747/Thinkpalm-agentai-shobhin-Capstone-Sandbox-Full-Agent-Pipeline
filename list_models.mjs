import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

async function list() {
  try {
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await modelsResponse.json();
    const names = data.models.map(m => m.name);
    fs.writeFileSync("models.json", JSON.stringify(names, null, 2));
  } catch (error) {
    console.error(error);
  }
}

list();
