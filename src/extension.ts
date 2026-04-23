// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { RegressifyTreeDataProvider } from './tree-data-provider';
import { getTestSuiteReportPath, getTestSuiteName } from './regressify-helpers';
import { executeRegressifyCommand } from './exec-command';
import { fileSystemWatcher } from './file-system-watcher';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "regressify" is now active!');

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';

  // Create and register the TreeDataProvider
  const regressifyProvider = new RegressifyTreeDataProvider(workspaceRoot);
  vscode.window.registerTreeDataProvider('regressifyExplorer', regressifyProvider);

  // Add refresh command for the TreeDataProvider
  const refreshCommand = vscode.commands.registerCommand('extension.refreshVisualTests', () => {
    regressifyProvider.refresh();
  });

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const helloWorldCommand = vscode.commands.registerCommand('regressify.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from Regressify!');
  });

  const openCommand = vscode.commands.registerCommand('regressify.open', (uri: vscode.Uri) => {
    // Open the file in the editor
    vscode.window.showTextDocument(uri);
  });

  const referenceCommand = vscode.commands.registerCommand('regressify.reference', (uri: vscode.Uri) => {
    executeRegressifyCommand('ref', uri);
  });

  const approveCommand = vscode.commands.registerCommand('regressify.approve', (uri: vscode.Uri) => {
    executeRegressifyCommand('approve', uri);
  });

  const testCommand = vscode.commands.registerCommand('regressify.test', (uri: vscode.Uri) => {
    executeRegressifyCommand('test', uri);
  });

  const updateCommand = vscode.commands.registerCommand('regressify.updateLibrary', () => {
    let terminal = vscode.window.terminals.find((t) => t.name === 'Regressify');
    if (!terminal) {
      terminal = vscode.window.createTerminal('Regressify');
    }

    terminal.sendText(`npm i -g regressify && regressify version && regressify init`);
    terminal.show();
  });

  const viewReportCommand = vscode.commands.registerCommand('regressify.viewReport', (uri: vscode.Uri) => {
    try {
      const testSuiteReportPath = getTestSuiteReportPath(uri);
      if (!testSuiteReportPath) {
        vscode.window.showErrorMessage('No report found');
        return;
      }

      vscode.workspace.fs.stat(vscode.Uri.file(testSuiteReportPath)).then(
        () => {
          // Open the report in the default browser
          vscode.env.openExternal(vscode.Uri.file(testSuiteReportPath));
        },
        () => {
          const testSuite = getTestSuiteName(uri);
          vscode.window.showErrorMessage(`No report found for ${testSuite}`);
        }
      );
    } catch (error) {
      console.error(error);
    }
  });

  const runTestCommand = vscode.commands.registerCommand('regressify.runTest', () => {
    // Get the active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active file!');
      return;
    }

    executeRegressifyCommand('test', editor.document.uri);
  });

  context.subscriptions.push(openCommand, refreshCommand, helloWorldCommand, referenceCommand, approveCommand, testCommand, viewReportCommand, updateCommand, runTestCommand, fileSystemWatcher('**/visual_tests/**/*.tests.{yaml,yml,json}', regressifyProvider.refresh), fileSystemWatcher('**/.backstop/**/html_report/index.html', regressifyProvider.refresh));
}

// This method is called when your extension is deactivated
export function deactivate() {}
