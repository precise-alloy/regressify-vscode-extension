import * as vscode from 'vscode';

export function fileSystemWatcher(globPattern: vscode.GlobPattern, handler: () => void): vscode.FileSystemWatcher {
  if (!handler) {
    throw new Error('Handler is required');
  }

  const watcher = vscode.workspace.createFileSystemWatcher(globPattern);

  watcher.onDidCreate(handler);
  watcher.onDidDelete(handler);
  watcher.onDidChange(handler);

  return watcher;
}
