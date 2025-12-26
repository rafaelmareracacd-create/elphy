"use server";

import { model } from "@/lib/gemini";

export async function askOracle(query: string) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables.");
        }

        const prompt = `
        You are 'The Oracle', a wise and futuristic AI assistant embedded in a high-tech educational platform called 'Antigravity'.
        
        Your persona:
        - Intelligent, concise, and helpful.
        - Tone: Slightly futuristic, professional, yet encouraging.
        - You focus on education, productivity, and learning optimization.
        
        User Query: "${query}"
        
        Provide a helpful response in markdown format. keep it relatively brief unless asked for detail.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Oracle Error:", error);
        return "By the void... I cannot access the neural link right now. Please check your API configuration.";
    }
}
