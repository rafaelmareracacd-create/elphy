import { writeFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');

// Conteúdo do .env.local baseado na imagem fornecida
const content = `NEXT_PUBLIC_SUPABASE_URL=https://ivlrikygrudnitujfakw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_PVBdvMTiPwqTFI4wgvEFFw_lIsllMQD
GEMINI_API_KEY=AIzaSyB_ez3Ctl1_Z8pN5by9G-1xP7kHf1_FBWk
`;

// Escrever sem BOM, apenas UTF-8 puro
writeFileSync(envPath, content, { encoding: 'utf8' });

console.log('✅ Arquivo .env.local recriado com sucesso!');
console.log('\nVariáveis configuradas:');
console.log('  1. NEXT_PUBLIC_SUPABASE_URL');
console.log('  2. NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('  3. GEMINI_API_KEY');
console.log('\n💡 Agora reinicie o servidor de desenvolvimento:');
console.log('   npm run dev');
