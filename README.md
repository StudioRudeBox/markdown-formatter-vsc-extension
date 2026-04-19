# VSC Markdown Formatter

Keyboard shortcuts and formatting commands for Markdown editing in VS Code.

## Features

| Shortcut (Win) | Shortcut (Mac) | Action |
|---|---|---|
| `Ctrl+B` | `Cmd+B` | Bold |
| `Ctrl+I` | `Cmd+I` | Italic |
| `Ctrl+U` | `Cmd+U` | Underline |
| `` Ctrl+` `` | `` Ctrl+` `` | Inline code |
| `Ctrl+K` | `Cmd+K` | Hyperlink |
| `Ctrl+Alt+I` | `Ctrl+Cmd+I` | Image |
| `Ctrl+M` | `Ctrl+M` | Inline math |
| `` Ctrl+Shift+` `` | `` Ctrl+Shift+` `` | Strikethrough |
| `Ctrl+-` | `Cmd+-` | Unordered list |
| `Ctrl+=` | `Cmd+=` | Ordered list |
| `Ctrl+Alt+1–6` | `Cmd+Alt+1–6` | Heading 1–6 |

All shortcuts toggle: applying the same shortcut to already-formatted text removes the formatting.

## Install from VSIX

1. Download the `.vsix` file from `build/`
2. In VS Code: `Extensions` → `...` → `Install from VSIX…`
3. Select the file and reload

Or via terminal:
```bash
code --install-extension build/markdown-formatter-vsc-extension-1.0.0.vsix
```

## Development

```bash
npm install           # install dependencies
npm run compile       # compile TypeScript
npm run watch         # watch and recompile on change
npm test              # run tests
npm run package       # build .vsix into build/
```

> **Note:** `npm run package` uses `scripts/package.js` instead of calling `vsce` directly.
> This works around a Windows limitation where `&` in the project path breaks npm script shell resolution.