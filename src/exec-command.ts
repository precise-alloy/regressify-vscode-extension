import type { RegressifyCommand } from './intefaces';
import * as vscode from 'vscode';
import { getTestSuiteName } from './regressify-helpers';

export function executeRegressifyCommand(command: RegressifyCommand, uri: vscode.Uri) {
  const filePath = uri.fsPath.toLowerCase();
  const testSuite = getTestSuiteName(uri);

  if (!testSuite) {
    vscode.window.showErrorMessage('Invalid file: ' + filePath);
    return;
  }

  vscode.window.showInformationMessage(`Running ${command} command...`);
  let terminal = vscode.window.terminals.find((t) => t.name === 'Regressify');
  if (!terminal) {
    terminal = vscode.window.createTerminal('Regressify');
  }

  terminal.sendText(`regressify ${command} --test-suite '${testSuite}'`);
  terminal.show();
}
