import { readFileSync } from 'fs';
import { resolve } from 'path';

// Ler .env.local
const envPath = resolve(process.cwd(), '.env.local');
const content = readFileSync(envPath, 'utf8');

// Parse manual
const vars = {};
content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            vars[key.trim()] = valueParts.join('=').trim();
        }
    }
});

const apiKey = vars['GEMINI_API_KEY'];

console.log('=== Testando Gemini API ===\n');
console.log('Chave API encontrada:', apiKey ? 'SIM' : 'NÃO');
console.log('Comprimento:', apiKey?.length || 0, 'caracteres');
console.log('Primeiros 20 chars:', apiKey?.substring(0, 20) || 'N/A');
console.log('Últimos 10 chars:', apiKey?.substring(apiKey?.length - 10) || 'N/A');

if (!apiKey) {
    console.log('\n❌ Chave API não encontrada no .env.local');
    process.exit(1);
}

console.log('\n🔍 Testando chamada à API...\n');

// Testar API
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        contents: [{
            parts: [{
                text: 'Responda apenas com: OK'
            }]
        }]
    })
})
    .then(async (response) => {
        console.log('Status:', response.status, response.statusText);
        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ SUCESSO! API está funcionando!');
            console.log('Resposta:', JSON.stringify(data, null, 2));
        } else {
            console.log('\n❌ ERRO na API:');
            console.log(JSON.stringify(data, null, 2));
        }
    })
    .catch(error => {
        console.log('\n❌ Erro na requisição:', error.message);
    });
