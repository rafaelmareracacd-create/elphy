import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read API key from .env.local
const envPath = resolve(process.cwd(), '.env.local');
const content = readFileSync(envPath, 'utf8');

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

console.log('=== Listando Modelos Gemini Disponíveis ===\n');

if (!apiKey) {
    console.log('❌ GEMINI_API_KEY não encontrada no .env.local');
    process.exit(1);
}

// List available models
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
    .then(async (response) => {
        console.log('Status:', response.status, response.statusText, '\n');
        const data = await response.json();

        if (response.ok) {
            console.log('✅ Conexão bem-sucedida!\n');

            if (data.models && data.models.length > 0) {
                console.log(`📋 Total de modelos disponíveis: ${data.models.length}\n`);

                // Filter for Gemini models only
                const geminiModels = data.models.filter(m => m.name.includes('gemini'));

                console.log('🤖 Modelos Gemini:\n');
                geminiModels.forEach(model => {
                    console.log(`  ✦ ${model.name.split('/').pop()}`);
                    console.log(`    Nome completo: ${model.name}`);
                    console.log(`    Versão: ${model.version || 'N/A'}`);
                    console.log(`    Display Name: ${model.displayName || 'N/A'}`);
                    console.log(`    Descrição: ${model.description || 'N/A'}`);

                    if (model.supportedGenerationMethods) {
                        console.log(`    Métodos: ${model.supportedGenerationMethods.join(', ')}`);
                    }
                    console.log('');
                });

                // Show which models support specific features
                console.log('\n📊 Modelos por Família:\n');
                const families = {};
                geminiModels.forEach(model => {
                    const name = model.name.split('/').pop();
                    const family = name.split('-').slice(0, 2).join('-'); // e.g., "gemini-1.5", "gemini-2.0"
                    if (!families[family]) {
                        families[family] = [];
                    }
                    families[family].push(name);
                });

                Object.entries(families).forEach(([family, models]) => {
                    console.log(`  ${family}:`);
                    models.forEach(m => console.log(`    - ${m}`));
                    console.log('');
                });

            } else {
                console.log('⚠️ Nenhum modelo encontrado');
            }
        } else {
            console.log('❌ Erro ao listar modelos:');
            console.log(JSON.stringify(data, null, 2));
        }
    })
    .catch(error => {
        console.log('❌ Erro na requisição:', error.message);
    });
