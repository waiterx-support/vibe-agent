// utils/togetherApi.js
import Papa from 'papaparse';
import { GEMINI_API_KEY, SYSTEM_PROMPT } from './constant';


let chatHistory = [{ role: "system", content: SYSTEM_PROMPT }];
let catalogInjected = false;

export const injectCatalogOnce = async () => {
  if (catalogInjected) return;
  const res = await fetch("/Apparels_shared.csv");
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true });
  const sample = parsed.data.slice(0, 20);
  const csvText = sample.map(row => Object.values(row).join(" | ")).join("\n");
  chatHistory.push({ role: "assistant", name: "catalog_preview", content: `Here is a sample of the product catalog:\n\n${csvText}` });
  catalogInjected = true;
};

async function callGemini(chat) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: chat
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini Response:", result);
    return result;
  } catch (error) {
    console.error("Request failed:", error);
  }
}

export const userTurn = async (userInput) => {
  // Append user message to chat history
  await injectCatalogOnce()
  chatHistory.push({ role: "user", parts: [{ text: userInput }] });

  try {
    const reply = callGemini(JSON.stringify(chatHistory)) || "No response from Gemini API.";

    // Append assistant's reply to chat history
    chatHistory.push({ role: "model", parts: [{ text: reply }] });

    return reply;
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    return "An error occurred while fetching the response.";
  }
};

export const clearChatHistory = () => {
  chatHistory = [{ role: "system", content: SYSTEM_PROMPT }];
  catalogInjected = false;
};
