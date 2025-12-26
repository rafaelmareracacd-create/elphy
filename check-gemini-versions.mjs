console.log('=== Verificando Versões Gemini Disponíveis (Sem API Key) ===\n');

// Public endpoint that doesn't require authentication
const url = 'https://generativelanguage.googleapis.com/v1beta/models';

console.log('Consultando endpoint público do Google...\n');

fetch(url)
    .then(async (response) => {
        console.log('Status:', response.status, response.statusText, '\n');
        const data = await response.json();

        if (response.ok && data.models) {
            const geminiModels = data.models.filter(m => m.name.includes('gemini'));

            console.log(`✅ Encontrados ${geminiModels.length} modelos Gemini\n`);
            console.log('═'.repeat(60));

            // Group by version
            const byVersion = {};
            geminiModels.forEach(model => {
                const name = model.name.split('/').pop();
                const versionMatch = name.match(/gemini-([\d.]+)/);
                const version = versionMatch ? versionMatch[1] : 'other';

                if (!byVersion[version]) {
                    byVersion[version] = [];
                }
                byVersion[version].push({
                    name: name,
                    displayName: model.displayName,
                    description: model.description
                });
            });

            // Sort versions
            const sortedVersions = Object.keys(byVersion).sort((a, b) => {
                const aNum = parseFloat(a);
                const bNum = parseFloat(b);
                return bNum - aNum; // Descending order
            });

            sortedVersions.forEach(version => {
                console.log(`\n🔹 Gemini ${version}`);
                console.log('─'.repeat(60));
                byVersion[version].forEach(model => {
                    console.log(`\n  Modelo: ${model.name}`);
                    if (model.displayName) {
                        console.log(`  Nome: ${model.displayName}`);
                    }
                    if (model.description) {
                        console.log(`  Descrição: ${model.description.substring(0, 80)}...`);
                    }
                });
            });

            console.log('\n' + '═'.repeat(60));
            console.log('\n💡 Para usar em seu projeto:\n');
            console.log('  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });');
            console.log('  // ou');
            console.log('  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });\n');

        } else {
            console.log('⚠️ Não foi possível listar os modelos');
            console.log('Resposta:', JSON.stringify(data, null, 2));
        }
    })
    .catch(error => {
        console.log('❌ Erro:', error.message);
        console.log('\n📚 Modelos conhecidos (Dezembro 2025):');
        console.log('\nGemini 2.5 (Mais recente):');
        console.log('  - gemini-2.5-pro       (melhor qualidade)');
        console.log('  - gemini-2.5-flash      (mais rápido, balanceado) ⭐ RECOMENDADO');
        console.log('  - gemini-2.5-flash-lite (mais leve)');
        console.log('\nGemini 2.0:');
        console.log('  - gemini-2.0-pro');
        console.log('  - gemini-2.0-flash');
        console.log('\nGemini 1.5 (Legado):');
        console.log('  - gemini-1.5-pro');
        console.log('  - gemini-1.5-flash');
    });
