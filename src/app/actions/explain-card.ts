"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function explainCardContent(content: string) {
    try {
        const prompt = `Explain the following concept briefly and provide a mnemonic or practical example to help with memorization. Context: EdTech Flashcard. Content: "${content}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Explanation Error:", error);
        return "Could not generate explanation at this time.";
    }
}
