const vscode = require('vscode');
const util = require('util');
const childProcess = require('child_process');

const exec = util.promisify(childProcess.exec);

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const grepdefCommand = vscode.commands.registerCommand(
		'vscode-grepdef.grepdef',
		async () => {
			const symbol = await vscode.window.showInputBox({
				placeHolder: 'GrepDef',
			});

			const results = await runGrepDef(symbol);
			const selectedFile = await vscode.window.showQuickPick(
				results.split(/\n/)
			);
			if (selectedFile) {
				const resultParts = selectedFile.split(':');
				if (resultParts.length === 3) {
					const fileName = resultParts[0];
					const lineNumber = parseInt(resultParts[1]);
					openFileAtLine(fileName, lineNumber);
				}
			}
		}
	);

	const grepdefWordCommand = vscode.commands.registerCommand(
		'vscode-grepdef.grepdefword',
		async () => {
			const symbol = getWordUnderCursor();
			const results = await runGrepDef(symbol);
			const selectedFile = await vscode.window.showQuickPick(
				results.split(/\n/)
			);
			if (selectedFile) {
				const resultParts = selectedFile.split(':');
				if (resultParts.length === 3) {
					const fileName = resultParts[0];
					const lineNumber = parseInt(resultParts[1]);
					openFileAtLine(fileName, lineNumber);
				}
			}
		}
	);

	context.subscriptions.push(grepdefCommand);
	context.subscriptions.push(grepdefWordCommand);
}
exports.activate = activate;

function deactivate() {}

/**
 *
 * @param {string} symbol
 * @returns {Promise<string>}
 */
async function runGrepDef(symbol) {
	const options = ['--line-number'];
	const grepdef = 'grepdef'; // TODO: make this configurable
	const workspaceDirectory = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const command = `${grepdef} ${options.join(
		' '
	)} "${symbol}" ${workspaceDirectory}`;
	const { stdout } = await exec(command);
	return stdout;
}

/**
 *
 * @param {string} fileName
 * @param {number} lineNumber
 */
async function openFileAtLine(fileName, lineNumber) {
	const document = await vscode.workspace.openTextDocument(fileName);
	await vscode.window.showTextDocument(document);
	const editor = vscode.window.activeTextEditor;
	const range = editor.document.lineAt(lineNumber - 1).range;
	editor.selection = new vscode.Selection(range.start, range.end);
	editor.revealRange(range);
}

/**
 * @returns {string|null}
 */
function getWordUnderCursor() {
	const editor = vscode.window.activeTextEditor;
	let wordRange = editor.document.getWordRangeAtPosition(
		editor.selection.start
	);
	if (!wordRange) {
		return null;
	}
	return editor.document.getText(wordRange);
}

module.exports = {
	activate,
	deactivate,
};