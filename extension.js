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
				placeHolder: 'Use grepdef to search for a symbol',
			});
			const isVersionValid = await isGrepDefVersionValid();
			if (!isVersionValid) {
				return;
			}
			const grepdefOutput = await runGrepDef(symbol);
			const matches = grepdefOutput.split(/\n/);
			showPickerForMatches(symbol, matches);
		}
	);

	const grepdefWordCommand = vscode.commands.registerCommand(
		'vscode-grepdef.grepdefword',
		async () => {
			const symbol = getWordUnderCursor();
			const isVersionValid = await isGrepDefVersionValid();
			if (!isVersionValid) {
				return;
			}
			const grepdefOutput = await runGrepDef(symbol);
			const matches = grepdefOutput.split(/\n/);
			showPickerForMatches(symbol, matches);
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
	const config = vscode.workspace.getConfiguration('vscode-grepdef');
	const grepdef = config.get('grepdefPath', 'grepdef');
	const workspaceDirectory = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const command = `${grepdef} ${options.join(
		' '
	)} "${symbol}" ${workspaceDirectory}`;
	let stdout = '';
	let stderr = '';
	try {
		const execOutput = await exec(command);
		stdout = execOutput.stdout;
		stderr = execOutput.stderr;
	} catch (error) {
		vscode.window.showErrorMessage(
			'GrepDef: An error occurred while running grepdef: ' + error
		);
	}
	if (stderr) {
		vscode.window.showErrorMessage(
			'GrepDef: An error occurred while running grepdef: ' + stderr
		);
	}
	return stdout;
}

/**
 * @returns {Promise<boolean>}
 */
async function isGrepDefVersionValid() {
	const options = ['--version'];
	const config = vscode.workspace.getConfiguration('vscode-grepdef');
	const grepdef = config.get('grepdefPath', 'grepdef');
	const command = `${grepdef} ${options.join(' ')}`;
	let stdout = '';
	let isVersionValid = false;
	try {
		const execOutput = await exec(command);
		stdout = execOutput.stdout;
	} catch (error) {
		isVersionValid = false;
	}
	if (/^grepdef \d+\.\d+\.\d+/.test(stdout)) {
		isVersionValid = true;
	}
	if (!isVersionValid) {
		vscode.window.showErrorMessage(
			'You must install grepdef version 2.0 or newer: https://github.com/sirbrillig/grepdef#installing'
		);
	}
	return isVersionValid;
}

/**
 * @param {string[]} matches
 */
async function showPickerForMatches(symbol, matches) {
	const quickPickItems = matches
		.map((match) => {
			const matchParts = match.split(':');
			if (matchParts.length < 3) {
				return null;
			}
			const item = {
				label: matchParts[2],
				detail: matchParts[0] + ':' + matchParts[1],
			};
			return item;
		})
		.filter(Boolean);
	if (quickPickItems.length < 1) {
		vscode.window.showErrorMessage(`GrepDef: No matches found for '${symbol}'`);
		return;
	}

	let selectedItem = quickPickItems[0];
	const input = await vscode.window.createQuickPick();
	input.items = quickPickItems;
	input.title = `Matching definitions for '${symbol}'`;
	input.placeholder = 'Filter matches';
	input.matchOnDetail = true;
	input.onDidChangeSelection((items) => (selectedItem = items[0]));
	input.onDidAccept(() => openQuickPickItem(selectedItem));
	input.onDidHide(() => input.dispose());
	input.show();
}

function openQuickPickItem(item) {
	if (!item.detail) {
		vscode.window.showErrorMessage(
			'GrepDef: Sorry, an error occurred opening that file.'
		);
		return;
	}
	openFileAtLine(item.detail);
}

/**
 * @param {string} fileAndLine
 */
async function openFileAtLine(fileAndLine) {
	const [fileName, lineNumberString] = fileAndLine.split(':');
	if (!fileName) {
		vscode.window.showErrorMessage(
			'GrepDef: Sorry, an error occurred opening that file.'
		);
		return;
	}
	const lineNumber = lineNumberString ? parseInt(lineNumberString) : 0;
	const document = await vscode.workspace.openTextDocument(fileName);
	await vscode.window.showTextDocument(document);
	const editor = vscode.window.activeTextEditor;
	const range = editor.document.lineAt(lineNumber - 1).range;
	editor.selection = new vscode.Selection(range.start, range.end);
	editor.revealRange(range, 1);
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
