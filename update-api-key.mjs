import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');

console.log('=== Atualizando GEMINI_API_KEY ===\n');

try {
    const content = readFileSync(envPath, 'utf8');

    // Replace the old key with the new one
    const newContent = content.replace(
        /GEMINI_API_KEY=.*/,
        'GEMINI_API_KEY=AIzaSyCwQnfMozNopZEhboTStMUXs77BoEk-WR4'
    );

    writeFileSync(envPath, newContent, 'utf8');

    console.log('✅ Chave atualizada com sucesso!');
    console.log('\n📝 Nova chave: AIzaSyCwQnfMozNopZEhboTStMUXs77BoEk-WR4');
    console.log('\n🔄 Próximo passo: Reinicie o servidor com "npm run dev"');

} catch (error) {
    console.error('❌ Erro ao atualizar:', error.message);
}
