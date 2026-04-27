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
| `Ctrl+Alt+S` | `Ctrl+Cmd+S` | Strikethrough |
| `Ctrl+-` | `Cmd+-` | Unordered list |
| `Ctrl+=` | `Cmd+=` | Ordered list |
| `Ctrl+Alt+1–6` | `Cmd+Alt+1–6` | Heading 1–6 |
| `Ctrl+Shift+.` | `Cmd+Shift+.` | Blockquote |
| — | — | Horizontal rule (command palette) |

All shortcuts toggle: applying the same shortcut to already-formatted text removes the formatting. Bold and italic stack: applying italic to bold text (or vice versa) produces `***bold italic***`, and each can be removed independently.

## Install

**From the VS Code Marketplace** (recommended):
Search for `markdown-formatter-vsc-extension` in the Extensions panel, or [install from the Marketplace](https://marketplace.visualstudio.com/items?itemName=studiorudebox.markdown-formatter-vsc-extension).

**From VSIX:**

1. Download the `.vsix` file from `build/`
2. In VS Code: `Extensions` → `...` → `Install from VSIX…`
3. Select the file and reload

Or via terminal:
```bash
code --install-extension build/markdown-formatter-vsc-extension-1.1.2.vsix
```

## Development

```bash
npm install           # install dependencies
npm run build         # compile TypeScript and build the .vsix
npm run compile       # compile TypeScript
npm run watch         # watch and recompile on change
npm test              # run tests
npm run package       # alias for npm run build
```

> **Note:** `npm run build` uses `scripts/build.js` instead of calling `vsce` directly.
> This works around a Windows limitation where `&` in the project path breaks npm script shell resolution.
