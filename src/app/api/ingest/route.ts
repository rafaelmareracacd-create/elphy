
import { NextRequest, NextResponse } from "next/server";
import { processExamPdf } from "@/lib/ingestion";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Adjust as needed
        },
    },
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const answerKeyFile = formData.get("answerKey") as File;

        if (!file || !answerKeyFile) {
            return NextResponse.json({ error: "Missing exam file or answer key file" }, { status: 400 });
        }

        // Convert Exam File to Base64
        const fileBuffer = await file.arrayBuffer();
        const fileBase64 = Buffer.from(fileBuffer).toString("base64");

        // Convert Answer Key File to Base64
        const answerKeyBuffer = await answerKeyFile.arrayBuffer();
        const answerKeyBase64 = Buffer.from(answerKeyBuffer).toString("base64");

        // Trigger Processing
        const result = await processExamPdf(fileBase64, answerKeyBase64);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            message: "Ingestion successful",
            insertedCount: result.inserted
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
