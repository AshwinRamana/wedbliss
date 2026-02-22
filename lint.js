const { execSync } = require('child_process');
try {
    execSync('npx eslint . --format json', { encoding: 'utf-8' });
    console.log("No ESLint errors");
} catch (error) {
    try {
        const data = JSON.parse(error.stdout);
        data.forEach(f => {
            f.messages.forEach(m => {
                console.log(`${f.filePath}:${m.line} - ${m.message}`);
            });
        });
    } catch (e) {
        console.log(error.stdout);
    }
}
