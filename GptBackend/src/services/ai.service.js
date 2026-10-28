import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function generateResponse(content) {
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: content
    });

    return response.text;
}

export { generateResponse };
