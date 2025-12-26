
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Initialize external clients lazily or inside functions to verify Env Vars at runtime
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const supabase = createClient(...)

const MODEL_NAME = "gemini-2.5-flash";
const EMBEDDING_MODEL = "text-embedding-004";

// Structure definition for Gemini Output
interface ExtractedItem {
    materia: string;
    comando: string;
    num_item: number;
    texto_item: string;
}

interface AnswerKeyItem {
    num_item: number;
    gabarito: string;
}

export async function processExamPdf(examFileBase64: string, answerKeyFileBase64: string) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY missing. Please restart server after editing .env.local");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // --- 1. Parallel Processing: Parse Exam & Parse Answer Key ---
        console.log("Starting parallel PDF processing...");

        // A. Parse Exam PDF
        const examPrompt = `
            Analyze this PDF page from the CACD exam. 
            Extract all valid "items" (questions to judge Right/Wrong).
            Return a JSON ARRAY where each object has:
            - "materia": The subject (e.g., História do Brasil, Política Internacional, Geografia, Economia, Direito). Infer from context.
            - "comando": The main statement or context text preceding the items.
            - "num_item": The item number (integer).
            - "texto_item": The text of the item itself (the statement to judge).

            Example format:
            [
              { "materia": "História", "comando": "Acerca da Era Vargas...", "num_item": 25, "texto_item": "A Revolução de 30 foi..." }
            ]
            
            IMPORTANT: Return ONLY the JSON array. No markdown formatting.
        `;

        const examPromise = model.generateContent([
            examPrompt,
            { inlineData: { data: examFileBase64, mimeType: "application/pdf" } },
        ]);

        // B. Parse Answer Key PDF
        const answerKeyPrompt = `
            Analyze this Answer Key (Gabarito) PDF.
            Extract the correct answer for each item number.
            Possible answers are usually C (Certo), E (Errado), or X/Anulada.
            Return a JSON ARRAY where each object has:
            - "num_item": The item number (integer).
            - "gabarito": The answer code (C, E, or X).

            Example format:
            [
              { "num_item": 25, "gabarito": "C" },
              { "num_item": 26, "gabarito": "E" }
            ]

            IMPORTANT: Return ONLY the JSON array. No markdown formatting.
        `;

        const answerKeyPromise = model.generateContent([
            answerKeyPrompt,
            { inlineData: { data: answerKeyFileBase64, mimeType: "application/pdf" } },
        ]);

        // Updates status
        const [examResult, answerKeyResult] = await Promise.all([examPromise, answerKeyPromise]);

        // --- 2. Process Results ---

        // Process Exam Data
        const examText = examResult.response.text();
        const cleanedExamJson = examText.replace(/```json/g, "").replace(/```/g, "");
        const extractedItems: ExtractedItem[] = JSON.parse(cleanedExamJson);

        // Process Answer Key Data
        const answerKeyText = answerKeyResult.response.text();
        const cleanedAnswerKeyJson = answerKeyText.replace(/```json/g, "").replace(/```/g, "");
        const extractedAnswers: AnswerKeyItem[] = JSON.parse(cleanedAnswerKeyJson);

        // Map for fast lookup
        const answerMap = new Map<number, string>();
        extractedAnswers.forEach(a => answerMap.set(a.num_item, a.gabarito));

        console.log(`Extracted ${extractedItems.length} questions and ${extractedAnswers.length} answers.`);

        // --- 3. Correlate & Generate Embeddings ---
        const questionsToInsert = [];

        for (const item of extractedItems) {
            const gabaritoInfo = answerMap.get(item.num_item);
            const gabarito = gabaritoInfo ? gabaritoInfo.toUpperCase() : null; // Handle missing keys?
            const anulado = gabarito === "X" || gabarito === "+" || gabarito === "*"; // Common symbols for annulled

            // Generate Embedding
            const textToEmbed = `${item.materia}: ${item.comando} ${item.texto_item}`;
            const embeddingResult = await genAI.getGenerativeModel({ model: EMBEDDING_MODEL }).embedContent(textToEmbed);
            const embedding = embeddingResult.embedding.values;

            questionsToInsert.push({
                materia: item.materia,
                comando: item.comando,
                num_item: item.num_item,
                texto_item: item.texto_item,
                gabarito: gabarito,
                anulado: anulado,
                embedding: embedding,
                examen_ano: 2025 // Hardcoded for this ingestion task
            });
        }

        // --- 4. Batch Insert into Supabase ---
        if (questionsToInsert.length > 0) {
            const { data, error } = await supabase
                .from("questions")
                .insert(questionsToInsert)
                .select();

            if (error) throw error;
            return { success: true, inserted: data.length };
        } else {
            return { success: true, inserted: 0 };
        }

    } catch (error: any) {
        console.error("Ingestion Error:", error);
        return { success: false, error: error.message };
    }
}
