"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generates a semantic hint for the current flashcard
 */
export async function generateHint(front: string, back: string) {
    try {
        const prompt = `Você é um tutor especializado ajudando um estudante brasileiro durante uma sessão de flashcards.

O flashcard atual é:
- Pergunta/Frente: "${front}"
- Resposta/Verso: "${back}"

Gere UMA DICA SEMÂNTICA curta (máximo 2 frases) que ajude o estudante a lembrar da resposta sem revelar diretamente.

A dica deve:
1. Dar contexto ou uma pista que ative a memória
2. Não revelar a resposta diretamente
3. Usar linguagem simples e direta

Responda APENAS com a dica, sem introduções ou explicações adicionais.
NÃO use formatação Markdown.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Hint Error:", error);
        return "Não foi possível gerar uma dica no momento.";
    }
}

/**
 * Generates a mnemonic for the current flashcard
 */
export async function generateMnemonic(front: string, back: string) {
    try {
        const prompt = `Você é um especialista em técnicas de memorização ajudando um estudante brasileiro.

O flashcard atual é:
- Pergunta/Frente: "${front}"  
- Resposta/Verso: "${back}"

Crie UM MNEMÔNICO criativo e memorável para ajudar a lembrar desta informação.

Técnicas que você pode usar:
- Acrônimos (primeira letra de cada palavra)
- Associações visuais ou engraçadas
- Rimas ou frases marcantes
- Histórias curtas

Responda APENAS com o mnemônico e uma breve explicação de como usar (máximo 3 linhas).
NÃO use formatação Markdown como **negrito** ou *itálico*.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Mnemonic Error:", error);
        return "Não foi possível gerar um mnemônico no momento.";
    }
}

/**
 * Answers a user question about the current flashcard
 */
export async function askTutor(question: string, cardFront: string, cardBack: string) {
    try {
        const prompt = `Você é um tutor especializado ajudando um estudante brasileiro durante uma sessão de flashcards.

O flashcard atual é:
- Pergunta/Frente: "${cardFront}"
- Resposta/Verso: "${cardBack}"

O estudante pergunta: "${question}"

Responda de forma:
1. Clara e didática
2. Focada no contexto do flashcard
3. Concisa (máximo 3-4 frases)
4. Encorajadora

Se a pergunta não estiver relacionada ao card, gentilmente redirecione para o conteúdo.
NÃO use formatação Markdown como **negrito** ou *itálico*.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Ask Error:", error);
        return "Não foi possível responder no momento. Tente novamente.";
    }
}
