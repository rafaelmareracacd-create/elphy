
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local');

try {
    // Read as raw buffer
    const buffer = fs.readFileSync(envPath);

    // Check for UTF-16LE BOM (FF FE)
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        console.log('Detected UTF-16LE BOM. Converting to UTF-8...');
        // Decode as UTF-16LE
        const content = buffer.toString('utf16le');
        // Write back as UTF-8
        fs.writeFileSync(envPath, content, 'utf8');
        console.log('Successfully converted .env.local to UTF-8.');
    } else {
        console.log('File does not appear to be UTF-16LE with BOM. Checking for null bytes...');
        // naive check for null bytes which indicate utf16 without bom usually
        if (buffer.includes(0x00)) {
            console.log('Detected null bytes. Trying to decode as utf16le...');
            const content = buffer.toString('utf16le');
            fs.writeFileSync(envPath, content, 'utf8');
            console.log('Converted.');
        } else {
            console.log('File appears to be standard encoding already.');
        }
    }
} catch (e) {
    console.error('Error fixing encoding:', e);
}
