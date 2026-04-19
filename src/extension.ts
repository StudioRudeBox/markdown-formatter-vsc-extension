import * as vscode from 'vscode';

function countLeadingAsterisks(text: string): number {
    let i = 0;
    while (i < text.length && text[i] === '*') i++;
    return i;
}

function countTrailingAsterisks(text: string): number {
    let i = text.length - 1;
    let count = 0;
    while (i >= 0 && text[i] === '*') { i--; count++; }
    return count;
}

// bold (stars=2) and italic (stars=1) with stacking support
function applyAsteriskFormat(editor: vscode.TextEditor, stars: number): void {
    const marker = '*'.repeat(stars);
    const selection = editor.selection;
    let didInsert = false;

    editor.edit(editBuilder => {
        if (selection.isEmpty) {
            const pos = selection.start;
            const beforeRange = new vscode.Range(pos.translate(0, -stars), pos);
            const afterRange = new vscode.Range(pos, pos.translate(0, stars));
            if (editor.document.getText(beforeRange) === marker && editor.document.getText(afterRange) === marker) {
                editBuilder.delete(beforeRange);
                editBuilder.delete(afterRange);
            } else {
                editBuilder.insert(pos, marker + marker);
                didInsert = true;
            }
        } else {
            const text = editor.document.getText(selection);
            const min = Math.min(countLeadingAsterisks(text), countTrailingAsterisks(text));
            const isApplied = stars === 1 ? min % 2 === 1 : min >= stars;
            if (isApplied) {
                editBuilder.replace(selection, text.slice(stars, -stars));
            } else {
                editBuilder.replace(selection, marker + text + marker);
                didInsert = true;
            }
        }
    }).then(() => {
        if (selection.isEmpty && didInsert) {
            const newPos = selection.start.translate(0, stars);
            editor.selection = new vscode.Selection(newPos, newPos);
        }
    });
}

// generic function for inline text replacement and cursor position adjustment
function formatText(editor: vscode.TextEditor, before: string, after: string = before): void {
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const selection = editor.selection;
    let deletedTextWithoutSelection = false;

    editor.edit(editBuilder => {
        if (selection.isEmpty) {
            const cursorPosition = selection.start;
            const beforeRange = new vscode.Range(cursorPosition.translate(0, -before.length), cursorPosition);
            const afterRange = new vscode.Range(cursorPosition, cursorPosition.translate(0, after.length));
            const textBefore = editor.document.getText(beforeRange);
            const textAfter = editor.document.getText(afterRange);
            if (textBefore === before && textAfter === after) {
                editBuilder.delete(beforeRange);
                editBuilder.delete(afterRange);
                deletedTextWithoutSelection = true;
            } else {
                editBuilder.insert(cursorPosition, before + after);
            }
        } else {
            const selectedText = editor.document.getText(selection);
            const beforePattern = new RegExp(`^${escapeRegExp(before)}`);
            const afterPattern = new RegExp(`${escapeRegExp(after)}$`);
            if (beforePattern.test(selectedText) && afterPattern.test(selectedText)) {
                const newText = selectedText.replace(beforePattern, '').replace(afterPattern, '');
                editBuilder.replace(selection, newText);
            } else {
                editBuilder.replace(selection, before + selectedText + after);
            }
        }
    }).then(() => {
        if (selection.isEmpty && !deletedTextWithoutSelection) {
            const newPosition = selection.start.translate(0, before.length);
            editor.selection = new vscode.Selection(newPosition, newPosition);
        } else if (!selection.isEmpty && after.includes('url')) {
            const newRange = new vscode.Range(
                selection.start,
                selection.start.translate(0, before.length + editor.document.getText(selection).length + after.length)
            );
            const newSelection = editor.document.getText(newRange);
            const urlIndex = newSelection.indexOf('url');
            if (urlIndex !== -1) {
                const newPosition = selection.start.translate(0, urlIndex);
                editor.selection = new vscode.Selection(newPosition, newPosition.translate(0, 3));
            }
        }
    });
}

// apply or toggle a heading prefix (e.g. "## ") on the current line
function applyHeading(editor: vscode.TextEditor, level: number): void {
    const hashes = '#'.repeat(level) + ' ';
    const document = editor.document;
    const selection = editor.selection;
    const anyHeadingPattern = /^#{1,6} /;

    editor.edit(editBuilder => {
        for (let i = selection.start.line; i <= selection.end.line; i++) {
            const line = document.lineAt(i);
            const lineText = line.text;
            const existingMatch = lineText.match(anyHeadingPattern);

            if (existingMatch && lineText.startsWith(hashes)) {
                // same heading level already present -- remove it (toggle off)
                const range = new vscode.Range(line.range.start, line.range.start.translate(0, hashes.length));
                editBuilder.delete(range);
            } else if (existingMatch) {
                // different heading level -- replace it with the requested one
                const range = new vscode.Range(line.range.start, line.range.start.translate(0, existingMatch[0].length));
                editBuilder.replace(range, hashes);
            } else {
                // no heading -- insert the prefix
                editBuilder.insert(line.range.start, hashes);
            }
        }
    });
}

export function activate(context: vscode.ExtensionContext): void {
    console.log('markdown-formatter-vsc-extension activated.');

    const boldDisposable = vscode.commands.registerCommand('markdown-shortcut.bold', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { applyAsteriskFormat(editor, 2); }
    });

    const italicsDisposable = vscode.commands.registerCommand('markdown-shortcut.italics', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { applyAsteriskFormat(editor, 1); }
    });

    const underlineDisposable = vscode.commands.registerCommand('markdown-shortcut.underline', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { formatText(editor, '<u>', '</u>'); }
    });

    const codeDisposable = vscode.commands.registerCommand('markdown-shortcut.code', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { formatText(editor, '`'); }
    });

    const commentDisposable = vscode.commands.registerCommand('markdown-shortcut.comment', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { formatText(editor, '<!--', '-->'); }
    });

    const hyperlinkDisposable = vscode.commands.registerCommand('markdown-shortcut.hyperlink', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { formatText(editor, '[', '](url)'); }
    });

    const imageDisposable = vscode.commands.registerCommand('markdown-shortcut.image', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { formatText(editor, '![', '](url)'); }
    });

    const inlineMathDisposable = vscode.commands.registerCommand('markdown-shortcut.inlineMath', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { formatText(editor, '$', '$'); }
    });

    const strikethroughDisposable = vscode.commands.registerCommand('markdown-shortcut.strikethrough', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) { formatText(editor, '~~'); }
    });

    const unorderedListDisposable = vscode.commands.registerCommand('markdown-shortcut.unorderedList', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            editor.edit(editBuilder => {
                let allStartWithDash = true;
                for (let i = selection.start.line; i <= selection.end.line; i++) {
                    const line = document.lineAt(i);
                    const lineText = line.text;
                    if (!lineText.trimStart().startsWith('-')) {
                        allStartWithDash = false;
                        editBuilder.insert(line.range.start, '- ');
                    } else if (!lineText.trimStart().startsWith('- ')) {
                        allStartWithDash = false;
                        editBuilder.insert(line.range.start.translate(0, 1), ' ');
                    }
                }
                if (allStartWithDash) {
                    for (let i = selection.start.line; i <= selection.end.line; i++) {
                        const line = document.lineAt(i);
                        const range = new vscode.Range(line.range.start, line.range.start.translate(0, 2));
                        editBuilder.delete(range);
                    }
                }
            });
        }
    });

    const sortedListDisposable = vscode.commands.registerCommand('markdown-shortcut.sortedList', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            editor.edit(editBuilder => {
                let lineNumber = 1;
                let allStartWithNumber = true;
                for (let i = selection.start.line; i <= selection.end.line; i++) {
                    const line = document.lineAt(i);
                    const lineText = line.text;
                    if (!lineText.trimStart().startsWith(`${lineNumber}.`)) {
                        allStartWithNumber = false;
                        editBuilder.insert(line.range.start, `${lineNumber}. `);
                    } else if (!lineText.trimStart().startsWith(`${lineNumber}. `)) {
                        allStartWithNumber = false;
                        const numberLength = lineNumber.toString().length;
                        editBuilder.insert(line.range.start.translate(0, numberLength + 1), ' ');
                    }
                    lineNumber++;
                }
                if (allStartWithNumber) {
                    for (let i = selection.start.line; i <= selection.end.line; i++) {
                        const line = document.lineAt(i);
                        const numberLength = lineNumber.toString().length;
                        const range = new vscode.Range(line.range.start, line.range.start.translate(0, numberLength + 2));
                        editBuilder.delete(range);
                    }
                }
            });
        }
    });

    const headingDisposables = [1, 2, 3, 4, 5, 6].map(level =>
        vscode.commands.registerCommand(`markdown-shortcut.heading${level}`, () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) { applyHeading(editor, level); }
        })
    );

    const blockquoteDisposable = vscode.commands.registerCommand('markdown-shortcut.blockquote', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            editor.edit(editBuilder => {
                let allStartWithQuote = true;
                for (let i = selection.start.line; i <= selection.end.line; i++) {
                    if (!document.lineAt(i).text.startsWith('> ')) {
                        allStartWithQuote = false;
                        break;
                    }
                }
                for (let i = selection.start.line; i <= selection.end.line; i++) {
                    const line = document.lineAt(i);
                    if (allStartWithQuote) {
                        editBuilder.delete(new vscode.Range(line.range.start, line.range.start.translate(0, 2)));
                    } else {
                        editBuilder.insert(line.range.start, '> ');
                    }
                }
            });
        }
    });

    const horizontalRuleDisposable = vscode.commands.registerCommand('markdown-shortcut.horizontalRule', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, '\n---\n');
            });
        }
    });

    context.subscriptions.push(
        boldDisposable, italicsDisposable, underlineDisposable, codeDisposable,
        commentDisposable, hyperlinkDisposable, imageDisposable, inlineMathDisposable,
        strikethroughDisposable, unorderedListDisposable, sortedListDisposable,
        ...headingDisposables,
        blockquoteDisposable, horizontalRuleDisposable
    );
}

export function deactivate(): void {}
