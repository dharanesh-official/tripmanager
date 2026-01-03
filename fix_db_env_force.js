const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

try {
    let content = fs.readFileSync(envPath, 'utf8');
    console.log('Original content length:', content.length);

    // Robustly remove ANY port number from mongodb+srv:// usage
    // The logic is: remove ":<digits>" that occurs AFTER the "@host" part but BEFORE "/" or "?"

    // First, let's just forcefully replace the specific pattern if regex is tricky
    // But regex is better. 
    // Matches: (@ [anything not : or /] ) : [digits] ( / or ? or end of string )
    const newContent = content.replace(/(@[^:\/]+):(\d+)([\/\?]|$)/g, '$1$3');

    if (content !== newContent) {
        fs.writeFileSync(envPath, newContent);
        console.log('Fixed .env.local: Removed port number from MongoDB URI.');
        console.log('New Content Preview:', newContent.substring(0, 50) + '...');
    } else {
        // If regex failed, let's try a simpler split approach since we know the structure
        console.log('Regex match didnt change anything. Attempting manual fix.');

        const lines = content.split('\n');
        const newLines = lines.map(line => {
            if (line.startsWith('MONGODB_URI=')) {
                // Remove :3000 or similar
                return line.replace(/:\d+\/globetrotter/, '/globetrotter')
                    .replace(/:\d+\/\?/, '/?');
            }
            return line;
        });

        if (lines.join('\n') !== newLines.join('\n')) {
            fs.writeFileSync(envPath, newLines.join('\n'));
            console.log('Fixed .env.local manually.');
        } else {
            console.log('No port number found to remove.');
        }
    }

} catch (err) {
    console.error('Error fixing .env.local:', err);
}
