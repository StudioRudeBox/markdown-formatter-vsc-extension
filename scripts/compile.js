const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [tsc, '-p', './', ...args], {
    stdio: 'inherit',
    shell: false,
    cwd: root,
});

if (result.error) {
    console.error(result.error);
    process.exit(1);
}
process.exit(result.status ?? 1);
