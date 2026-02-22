const { execSync } = require('child_process');
try {
    execSync('npx next lint', { stdio: 'pipe' });
    console.log("No ESLint errors");
} catch (error) {
    const o = error.stdout ? error.stdout.toString('utf8') : '';
    const e = error.stderr ? error.stderr.toString('utf8') : '';
    console.log("STDOUT:\n" + o);
    console.log("STDERR:\n" + e);
}
