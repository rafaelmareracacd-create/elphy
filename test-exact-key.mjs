// Direct test with the exact key from .env.local
const API_KEY = 'AIzaSyB_ez3Ctl1_Z8pN5by9G-1xP7kHf1_FBWk';

console.log('=== Testing Exact Key from .env.local ===\n');
console.log('Key:', API_KEY);
console.log('Length:', API_KEY.length);

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

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
        console.log('\nStatus:', response.status, response.statusText);
        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ SUCCESS! Key is VALID!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('\n❌ ERROR:');
            console.log(JSON.stringify(data, null, 2));
        }
    })
    .catch(error => {
        console.log('\n❌ Request failed:', error.message);
    });
