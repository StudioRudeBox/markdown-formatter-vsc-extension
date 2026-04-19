import * as vscode from 'vscode';
import * as assert from 'assert';

async function testMarkdownCommand(
    commandId: string,
    initialText: string,
    expectedText: string,
    assertMessage: string
): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({ content: initialText });
    const editor = await vscode.window.showTextDocument(doc);
    editor.selection = new vscode.Selection(
        new vscode.Position(0, 0),
        new vscode.Position(0, initialText.length)
    );
    await vscode.commands.executeCommand(commandId);
    assert.strictEqual(doc.getText(), expectedText, assertMessage);
}

suite('Extension Test Suite', () => {
    suiteSetup(() => {
        vscode.window.showInformationMessage('Running all tests.');
    });

    suiteTeardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    afterEach(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    // apply formatting
    test('Bold', () => testMarkdownCommand('markdown-shortcut.bold', 'Hello', '**Hello**', 'should be bold'));
    test('Italic', () => testMarkdownCommand('markdown-shortcut.italics', 'Hello', '*Hello*', 'should be italic'));
    test('Underline', () => testMarkdownCommand('markdown-shortcut.underline', 'Hello', '<u>Hello</u>', 'should be underlined'));
    test('Inline code', () => testMarkdownCommand('markdown-shortcut.code', 'Hello', '`Hello`', 'should be inline code'));
    test('Strikethrough', () => testMarkdownCommand('markdown-shortcut.strikethrough', 'Hello', '~~Hello~~', 'should be strikethrough'));
    test('Hyperlink', () => testMarkdownCommand('markdown-shortcut.hyperlink', 'Hello', '[Hello](url)', 'should be a hyperlink'));
    test('Image', () => testMarkdownCommand('markdown-shortcut.image', 'Hello', '![Hello](url)', 'should be an image'));
    test('Blockquote', () => testMarkdownCommand('markdown-shortcut.blockquote', 'Hello', '> Hello', 'should be a blockquote'));
    test('Stack italic on bold', () => testMarkdownCommand('markdown-shortcut.italics', '**Hello**', '***Hello***', 'should add italic to bold'));
    test('Stack bold on italic', () => testMarkdownCommand('markdown-shortcut.bold', '*Hello*', '***Hello***', 'should add bold to italic'));

    // toggle (remove) formatting
    test('Remove bold', () => testMarkdownCommand('markdown-shortcut.bold', '**Hello**', 'Hello', 'bold should be removed'));
    test('Remove italic', () => testMarkdownCommand('markdown-shortcut.italics', '*Hello*', 'Hello', 'italic should be removed'));
    test('Remove underline', () => testMarkdownCommand('markdown-shortcut.underline', '<u>Hello</u>', 'Hello', 'underline should be removed'));
    test('Remove inline code', () => testMarkdownCommand('markdown-shortcut.code', '`Hello`', 'Hello', 'inline code should be removed'));
    test('Remove strikethrough', () => testMarkdownCommand('markdown-shortcut.strikethrough', '~~Hello~~', 'Hello', 'strikethrough should be removed'));
    test('Remove hyperlink', () => testMarkdownCommand('markdown-shortcut.hyperlink', '[Hello](url)', 'Hello', 'hyperlink should be removed'));
    test('Remove image', () => testMarkdownCommand('markdown-shortcut.image', '![Hello](url)', 'Hello', 'image should be removed'));
    test('Remove blockquote', () => testMarkdownCommand('markdown-shortcut.blockquote', '> Hello', 'Hello', 'blockquote should be removed'));
    test('Unstack bold from bold+italic', () => testMarkdownCommand('markdown-shortcut.bold', '***Hello***', '*Hello*', 'should remove bold, leaving italic'));
    test('Unstack italic from bold+italic', () => testMarkdownCommand('markdown-shortcut.italics', '***Hello***', '**Hello**', 'should remove italic, leaving bold'));
});
