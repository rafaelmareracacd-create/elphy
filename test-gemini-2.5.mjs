import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env.local
const envPath = resolve(process.cwd(), '.env.local');
const content = readFileSync(envPath, 'utf8');

// Parse manually
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

console.log('=== Testing Gemini 2.5 Flash ===\n');
console.log('Key found:', apiKey ? 'YES' : 'NO');

if (!apiKey) {
    console.log('\n❌ API Key not found in .env.local');
    process.exit(1);
}

console.log('Testing with model: gemini-2.5-flash\n');

// Test with Gemini 2.5 Flash
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        contents: [{
            parts: [{
                text: 'Say OK'
            }]
        }]
    })
})
    .then(async (response) => {
        console.log('Status:', response.status, response.statusText);
        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ SUCCESS! Gemini 2.5 Flash is working!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('\n❌ ERROR:');
            console.log(JSON.stringify(data, null, 2));
        }
    })
    .catch(error => {
        console.log('\n❌ Request failed:', error.message);
    });
