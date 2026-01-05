"use client"

import { Suspense } from "react";
import AnkiModule from "@/components/modules/Anki";

export default function AnkiPage() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
                <AnkiModule />
            </Suspense>
        </div>
    );
}
