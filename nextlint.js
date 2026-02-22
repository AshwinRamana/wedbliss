const { execSync } = require('child_process');
try {
    execSync('npx next lint -f json', { encoding: 'utf-8' });
    console.log("No ESLint errors");
} catch (error) {
    try {
        const data = JSON.parse(error.stdout);
        data.forEach(f => {
            f.messages.forEach(m => {
                if (m.severity === 2) console.log(`ERROR: ${f.filePath}:${m.line} - ${m.message}`);
            });
        });
    } catch (e) {
        console.log(error.stdout);
    }
}
