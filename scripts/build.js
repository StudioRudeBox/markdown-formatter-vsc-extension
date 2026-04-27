const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const vsceScript = path.join(root, 'node_modules', '@vscode', 'vsce', 'vsce');
const result = spawnSync(process.execPath, [vsceScript, 'package', '--out', 'build/'], {
    stdio: 'inherit',
    shell: false,
    cwd: root,
});

if (result.error) {
    console.error(result.error);
    process.exit(1);
}

process.exit(result.status ?? 1);
