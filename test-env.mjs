import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('=== Verificando .env.local ===\n');

try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf8');

    console.log('Arquivo .env.local encontrado!');
    console.log('Tamanho:', content.length, 'bytes\n');

    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log('Variáveis configuradas:', lines.length, '\n');

    lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
            const masked = value.length > 40
                ? `${value.substring(0, 20)}...${value.substring(value.length - 10)}`
                : value.substring(0, 20) + '...';
            console.log(`✅ ${key.trim()}: ${masked}`);
        }
    });

    console.log('\n=== Diagnóstico ===');

    const hasGeminiKey = content.includes('GEMINI_API_KEY=');
    const hasSupabaseUrl = content.includes('NEXT_PUBLIC_SUPABASE_URL=');
    const hasSupabaseKey = content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');

    if (hasGeminiKey) {
        console.log('✅ GEMINI_API_KEY está presente');
    } else {
        console.log('❌ GEMINI_API_KEY NÃO encontrada');
    }

    if (hasSupabaseUrl && hasSupabaseKey) {
        console.log('✅ Variáveis Supabase estão presentes');
    } else {
        console.log('❌ Variáveis Supabase incompletas');
    }

    console.log('\n💡 Próximo passo: Reinicie o servidor de desenvolvimento (npm run dev)');

} catch (error) {
    console.error('❌ Erro ao ler .env.local:', error.message);
}
