
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'


// Load env vars manually because we are running with tsx
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    console.log('Reading .env from:', envPath);

    if (!fs.existsSync(envPath)) {
        console.error('File does not exist at path!');
    } else {
        const envFile = fs.readFileSync(envPath, 'utf8');
        console.log('File length:', envFile.length);
        console.log('First 20 chars:', JSON.stringify(envFile.substring(0, 20)));

        envFile.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const val = values.join('=').trim();
                const cleanKey = key.trim();
                // Remove quotes if present
                process.env[cleanKey] = val.replace(/^["']|["']$/g, '');
                console.log(`Loaded key: "${cleanKey}"`);
            }
        });
    }
} catch (e) {
    console.log('Could not load .env.local:', e);
}


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('flashcards').select('*').limit(1);

        if (error) {
            console.error('❌ Erro na conexão com Supabase:', error.message);
            if (error.code === '42P01') {
                console.error('⚠️ A tabela "flashcards" não foi encontrada. As migrações podem não ter sido aplicadas.');
            }
        } else {
            console.log('✅ Conexão com Supabase bem-sucedida!');
            console.log('Tabela "flashcards" acessível.');
        }

        // Tenta acessar a tabela questions
        const { data: qData, error: qError } = await supabase.from('questions').select('*').limit(1);
        if (qError) {
            console.log('ℹ️ Tabela "questions" inacessível ou não existe ainda:', qError.message);
        } else {
            console.log('✅ Tabela "questions" acessível.');
        }


    } catch (err) {
        console.error('❌ Erro inesperado:', err);
    }
}

testConnection();
