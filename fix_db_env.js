const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

try {
    let content = fs.readFileSync(envPath, 'utf8');
    console.log('Original content length:', content.length);

    // Regex to find mongodb+srv and remove port number if present
    // Matches mongodb+srv://... @ host : port /
    const newContent = content.replace(
        /(mongodb\+srv:\/\/[^@]+@[^:\/]+)(:\d+)(\/|\?|$)/g,
        (match, p1, p2, p3) => {
            console.log(`Found port ${p2} in URI, removing it.`);
            return p1 + p3;
        }
    );

    if (content !== newContent) {
        fs.writeFileSync(envPath, newContent);
        console.log('Fixed .env.local: Removed port number from MongoDB URI.');
    } else {
        console.log('No port number found to remove in MongoDB URI.');
    }

} catch (err) {
    console.error('Error fixing .env.local:', err);
}
