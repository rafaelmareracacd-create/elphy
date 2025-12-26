import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const content = readFileSync(envPath, 'utf8');

console.log('=== Conteúdo Atual do .env.local ===\n');
console.log(content);
console.log('\n=== Fim do Arquivo ===');

// Parse para verificar
const lines = content.split('\n').filter(line => line.trim());
const geminiLine = lines.find(line => line.includes('GEMINI_API_KEY'));

if (geminiLine) {
    const [, value] = geminiLine.split('=');
    console.log('\n🔑 Chave atual:');
    console.log('   Primeiros 20:', value?.substring(0, 20) || 'N/A');
    console.log('   Últimos 10:', value?.substring(value?.length - 10) || 'N/A');
    console.log('   Comprimento total:', value?.length || 0);

    // Verificar se é a chave antiga
    if (value?.includes('AIzaSyB_ez3Ctl1_Z8pN5by9G-1xP7kHf1_FBWk')) {
        console.log('\n⚠️  ATENÇÃO: Esta ainda é a chave ANTIGA (inválida)!');
        console.log('   Você precisa substituí-la por uma NOVA chave do Google AI Studio.');
    } else {
        console.log('\n✅ Esta parece ser uma chave diferente.');
        console.log('   Vamos testar se ela funciona...');
    }
}
