"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function explainCardContent(content: string) {
    try {
        const prompt = `Você é um tutor especializado ajudando um estudante brasileiro. Explique o seguinte conceito ou palavra de forma concisa e didática, sempre em PORTUGUÊS.
        O contexto é um Flashcard de estudo.
        
        Conteúdo para explicar: "${content}"
        
        Sua resposta deve ter:
        1. Uma explicação breve e clara em português.
        2. Um exemplo prático de uso ou mnemônico para ajudar na memorização.
        3. Se for uma palavra em língua estrangeira, foque no significado e uso para um falante de português.
        
        Mantenha o tom encorajador e direto.
        IMPORTANTE: NÃO use formatação Markdown como negrito (**texto**) ou itálico (*texto*). Use apenas texto simples.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Explanation Error:", error);
        return "Could not generate explanation at this time.";
    }
}
