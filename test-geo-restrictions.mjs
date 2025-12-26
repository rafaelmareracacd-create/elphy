import { readFileSync } from 'fs';
import { resolve } from 'path';

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

console.log('=== Teste de Restrições Geográficas ===\n');

if (!apiKey) {
    console.log('❌ API Key não encontrada');
    process.exit(1);
}

console.log('🌍 Testando de:', 'Brasil (detectado automaticamente)\n');

// Test 1: Try with a simple model list request
console.log('📋 Teste 1: Listando modelos disponíveis...');
const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(listUrl)
    .then(async (response) => {
        const data = await response.json();

        if (response.status === 400) {
            console.log('❌ Status 400: API_KEY_INVALID');
            console.log('\n🔍 Analisando detalhes do erro:\n');
            console.log(JSON.stringify(data, null, 2));

            if (data.error?.details) {
                const errorInfo = data.error.details.find(d => d['@type']?.includes('ErrorInfo'));
                if (errorInfo) {
                    console.log('\n💡 Informações do erro:');
                    console.log('  Razão:', errorInfo.reason);
                    console.log('  Domínio:', errorInfo.domain);
                    console.log('  Serviço:', errorInfo.metadata?.service);
                }
            }

            console.log('\n🌎 Possíveis causas relacionadas à localização:\n');
            console.log('1. ⛔ Restrições de IP configuradas na chave');
            console.log('   → A chave pode estar restrita a IPs específicos');
            console.log('   → Seu IP do Brasil pode não estar na whitelist\n');

            console.log('2. 🌐 Restrições de domínio/referrer');
            console.log('   → A chave pode aceitar apenas requisições de domínios específicos');
            console.log('   → Requisições do localhost podem estar bloqueadas\n');

            console.log('3. 🗺️ Restrições geográficas no projeto Google Cloud');
            console.log('   → O projeto pode ter restrições regionais');
            console.log('   → API pode não estar habilitada para o Brasil\n');

            console.log('4. 🔑 Chave realmente inválida (mais provável)');
            console.log('   → Chave pode ter sido revogada');
            console.log('   → Chave pode ter expirado');
            console.log('   → Chave pode ter sido gerada incorretamente\n');

        } else if (response.status === 403) {
            console.log('❌ Status 403: PERMISSION_DENIED');
            console.log('   → Isso geralmente indica restrições de acesso');
            console.log('   → Pode ser limite regional ou de projeto\n');
            console.log(JSON.stringify(data, null, 2));

        } else if (response.ok) {
            console.log('✅ Conexão bem-sucedida!');
            console.log('   → Sem restrições geográficas detectadas');
            console.log('   → API acessível do Brasil');
            console.log(`   → ${data.models?.length || 0} modelos disponíveis\n`);
        }

        console.log('\n📍 Como verificar restrições:\n');
        console.log('1. Acesse: https://console.cloud.google.com/apis/credentials');
        console.log('2. Encontre sua API key');
        console.log('3. Clique em "Edit" (editar)');
        console.log('4. Verifique:');
        console.log('   - Application restrictions (Nenhuma ou HTTP referrers)');
        console.log('   - API restrictions (Todas ou apenas Gemini)');
        console.log('   - IP address restrictions (Nenhuma recomendado para testes)\n');

    })
    .catch(error => {
        console.log('❌ Erro de rede:', error.message);
        console.log('\n   Isso pode indicar bloqueio de rede ou firewall');
    });
