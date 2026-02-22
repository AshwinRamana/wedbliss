const { spawnSync } = require('child_process');
const result = spawnSync('npm.cmd', ['run', 'build'], { encoding: 'utf-8' });
console.log("=== STDOUT ===");
console.log(result.stdout);
console.log("=== STDERR ===");
console.log(result.stderr);
