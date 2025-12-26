import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    const cwd = process.cwd();
    let files: string[] = [];
    try {
        files = fs.readdirSync(cwd);
    } catch (e) {
        files = ["Error reading directory"];
    }

    const envLocalExists = files.includes(".env.local");
    const envExists = files.includes(".env");

    // Attempt to read it manually (careful not to expose full secrets in logs)
    let manualRead = "Not attempted";
    if (envLocalExists) {
        try {
            const content = fs.readFileSync(path.join(cwd, ".env.local"), "utf-8");
            const lines = content.split("\n");
            const keyLine = lines.find(l => l.startsWith("GEMINI_API_KEY"));
            manualRead = keyLine ? `Found line starting with GEMINI_API_KEY (Length: ${keyLine.length})` : "GEMINI_API_KEY line not found in file";
        } catch (e: any) {
            manualRead = "Error reading file: " + e.message;
        }
    }

    return NextResponse.json({
        status: process.env.GEMINI_API_KEY ? "success" : "missing_env_var",
        message: process.env.GEMINI_API_KEY ? "Loaded by Process" : "NOT Loaded by Process",
        cwd: cwd,
        files_in_root: files.filter(f => f.startsWith(".env")),
        manual_check: manualRead,
        env_var_value_preview: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + "..." : "undefined"
    });
}
