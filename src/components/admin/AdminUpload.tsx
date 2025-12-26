
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function AdminUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [answerKey, setAnswerKey] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const [isDraggingExam, setIsDraggingExam] = useState(false);
    const [isDraggingKey, setIsDraggingKey] = useState(false);

    const handleDrag = (e: React.DragEvent, setDragging: (v: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragging(true);
        } else if (e.type === "dragleave") {
            setDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent, setFile: (f: File) => void, setDragging: (v: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File) => void) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !answerKey) {
            alert("Please provide both file and answer key.");
            return;
        }

        setStatus("uploading");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("answerKey", answerKey);

            const res = await fetch("/api/ingest", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Upload failed");

            setStatus("success");
            setMessage(`Success! Processed ${data.insertedCount} items.`);
        } catch (error: any) {
            setStatus("error");
            setMessage(error.message);
        }
    };

    return (
        <Card className="p-6 max-w-2xl mx-auto mt-10 space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Upload className="w-6 h-6" /> Ingestão CACD 2025
                </h2>
                <p className="text-muted-foreground">
                    Upload PDF pages and map directly to database with embeddings.
                </p>
            </div>

            <div className="space-y-6">
                {/* Exam PDF Drop Zone */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Prova (PDF)</label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition cursor-pointer relative ${isDraggingExam ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                            }`}
                        onDragEnter={(e) => handleDrag(e, setIsDraggingExam)}
                        onDragOver={(e) => handleDrag(e, setIsDraggingExam)}
                        onDragLeave={(e) => handleDrag(e, setIsDraggingExam)}
                        onDrop={(e) => handleDrop(e, setFile, setIsDraggingExam)}
                    >
                        <input
                            type="file"
                            accept="application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(e, setFile)}
                        />
                        <FileText className={`w-10 h-10 mb-4 ${isDraggingExam ? "text-primary" : "text-muted-foreground"}`} />
                        {file ? (
                            <span className="font-semibold text-primary">{file.name}</span>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">Drag & drop or click to upload</span>
                                <span className="text-xs text-muted-foreground">PDF (MAX. 10MB)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Answer Key Drop Zone */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Gabarito (PDF)</label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition cursor-pointer relative ${isDraggingKey ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-500/30 hover:bg-emerald-500/5"
                            }`}
                        onDragEnter={(e) => handleDrag(e, setIsDraggingKey)}
                        onDragOver={(e) => handleDrag(e, setIsDraggingKey)}
                        onDragLeave={(e) => handleDrag(e, setIsDraggingKey)}
                        onDrop={(e) => handleDrop(e, setAnswerKey, setIsDraggingKey)}
                    >
                        <input
                            type="file"
                            accept="application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(e, setAnswerKey)}
                        />
                        <CheckCircle className={`w-10 h-10 mb-4 ${isDraggingKey ? "text-emerald-500" : "text-emerald-500/50"}`} />
                        {answerKey ? (
                            <span className="font-semibold text-emerald-500">{answerKey.name}</span>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <span className="font-medium ">Drag & drop Gabarito</span>
                                <span className="text-xs text-muted-foreground">Official Answer Key PDF</span>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={status === "uploading"}
                >
                    {status === "uploading" ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing AI...
                        </>
                    ) : (
                        "Start Ingestion"
                    )}
                </Button>

                {status === "success" && (
                    <div className="bg-green-500/10 text-green-600 p-4 rounded-md flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> {message}
                    </div>
                )}

                {status === "error" && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> {message}
                    </div>
                )}
            </div>
        </Card>
    );
}
