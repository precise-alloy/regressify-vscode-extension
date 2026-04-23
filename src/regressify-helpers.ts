import { basename } from 'path';
import * as vscode from 'vscode';

const testExtensions = ['.tests.yaml', '.tests.yml', '.tests.json'];

export function isTestSuiteFile(uri: vscode.Uri): boolean {
  const filePath = uri.fsPath.toLowerCase();

  return testExtensions.some((extension) => filePath.endsWith(extension));
}

export function getTestSuiteName(file: vscode.Uri): string | null {
  const fileName = basename(file.fsPath);
  const fileNameLowerCase = fileName.toLowerCase();

  for (const extension of testExtensions) {
    if (fileNameLowerCase.endsWith(extension)) {
      return fileName.slice(0, -extension.length);
    }
  }

  return null;
}

export function getTestSuiteReportPath(uri: vscode.Uri): string | null {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
  const testSuite = getTestSuiteName(uri);

  if (!testSuite) {
    return null;
  }

  // Check if `.backstop/{testSuite}/html_report/index.html` exists, and open it if it does
  return `${workspaceRoot}/.backstop/${testSuite}/html_report/index.html`;
}

export async function hasTestSuiteReport(uri: vscode.Uri): Promise<boolean> {
  try {
    const testSuiteReportPath = getTestSuiteReportPath(uri);

    if (!testSuiteReportPath) {
      return false;
    }

    const stat = await vscode.workspace.fs.stat(vscode.Uri.file(testSuiteReportPath));

    return stat.type === vscode.FileType.File;
  } catch {
    return false;
  }
}
