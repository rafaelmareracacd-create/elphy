"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

interface Question {
    content: string;
    subject: {
        name: string;
        topic?: string;
        legislation?: string;
    };
    exam: {
        name: string;
        institution: string;
        year: number;
    };
    correctAnswer: string;
    explanation?: string;
}

interface Flashcard {
    front: string;
    back: string;
}

export async function generateFlashcardsFromQuestion(question: Question): Promise<Flashcard[]> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `Você é um especialista em criar flashcards para spaced repetition (Anki).

Com base na seguinte questão de concurso público, gere 2-3 flashcards que ajudem o estudante a memorizar os conceitos-chave.

**Questão:**
${question.content}

**Resposta Correta:** ${question.correctAnswer}

**Explicação:** ${question.explanation || "Não fornecida"}

**Contexto:**
- Matéria: ${question.subject.name}
- Assunto: ${question.subject.topic || "Não especificado"}
- Legislação: ${question.subject.legislation || "Não aplicável"}
- Banca: ${question.exam.institution} (${question.exam.year})

**Instruções:**
1. Crie flashcards focados em MEMORIZAÇÃO de conceitos específicos
2. Cada flashcard deve ter uma FRENTE (pergunta curta e direta) e um VERSO (resposta concisa)
3. Use linguagem clara e objetiva
4. Foque em detalhes importantes mencionados na questão
5. Se houver legislação específica, crie um flashcard sobre ela
6. IMPORTANTE: Retorne APENAS um array JSON válido, sem texto adicional

**Formato de saída (JSON):**
[
  {
    "front": "Pergunta objetiva aqui?",
    "back": "Resposta concisa aqui."
  },
  {
    "front": "Outra pergunta?",
    "back": "Outra resposta."
  }
]`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response (remove markdown code blocks if present)
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("Failed to extract JSON from AI response");
        }

        const flashcards: Flashcard[] = JSON.parse(jsonMatch[0]);

        // Validate flashcards
        if (!Array.isArray(flashcards) || flashcards.length === 0) {
            throw new Error("Invalid flashcards format");
        }

        return flashcards;
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw new Error("Falha ao gerar flashcards. Tente novamente.");
    }
}
