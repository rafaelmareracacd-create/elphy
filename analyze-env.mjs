import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const buffer = readFileSync(envPath);

console.log('=== Análise Detalhada do .env.local ===\n');
console.log('Tamanho do buffer:', buffer.length, 'bytes');
console.log('Encoding detectado: Verificando BOM...');

// Check BOM
if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    console.log('⚠️  UTF-16LE BOM detectado');
} else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    console.log('ℹ️  UTF-8 BOM detectado');
} else {
    console.log('✅ Sem BOM (normal)');
}

// Read as UTF-8
const content = buffer.toString('utf8');
console.log('\n=== Conteúdo (UTF-8) ===');
console.log(content);
console.log('\n=== Linhas ===');

content.split('\n').forEach((line, i) => {
    console.log(`Linha ${i + 1} [${line.length} chars]:`, JSON.stringify(line));
});

console.log('\n=== Bytes (primeiros 50) ===');
console.log(buffer.slice(0, Math.min(50, buffer.length)));
