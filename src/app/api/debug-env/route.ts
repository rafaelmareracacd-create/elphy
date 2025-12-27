// Test if Next.js can read the env var at build/runtime
import { NextResponse } from 'next/server';

export async function GET() {
    const key = process.env.GEMINI_API_KEY;
    const publicKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    return NextResponse.json({
        hasKey: !!key,
        keyLength: key?.length || 0,
        keyPreview: key ? `${key.substring(0, 10)}...${key.substring(key.length - 5)}` : 'undefined',
        hasPublicKey: !!publicKey,
        publicKeyLength: publicKey?.length || 0,
        publicKeyPreview: publicKey ? `${publicKey.substring(0, 10)}...${publicKey.substring(publicKey.length - 5)}` : 'undefined',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('SUPABASE')),
    });
}
