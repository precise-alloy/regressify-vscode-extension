import * as vscode from 'vscode';
import { getTestSuiteName, hasTestSuiteReport } from './regressify-helpers';

export class RegressifyTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No workspace folder found');
      return Promise.resolve([]);
    }

    // If no parent element, return root-level items
    if (!element) {
      return Promise.resolve(this.getTestFiles());
    }

    // If parent is a `.tests.yaml`, `.tests.yml` or `.tests.json` file, return buttons as children
    if (element.contextValue === 'testFile') {
      return Promise.resolve(this.getTestActions(element));
    }

    return Promise.resolve([]);
  }

  private async getTestFiles(): Promise<vscode.TreeItem[]> {
    const files = await vscode.workspace.findFiles('visual_tests/*.tests.{yaml,yml,json}'); // Find all test files
    files.sort((a, b) => (getTestSuiteName(a) || '').localeCompare(getTestSuiteName(b) || '')); // Sort files by name

    console.log(
      'Matched files:',
      files.map((file) => file.fsPath)
    ); // Log matched files

    const items: vscode.TreeItem[] = [];

    for (const file of files) {
      const testSuite = getTestSuiteName(file);
      if (!testSuite) {
        continue;
      }

      const treeItem = new vscode.TreeItem(testSuite, vscode.TreeItemCollapsibleState.Collapsed);
      treeItem.contextValue = 'testFile'; // Custom context value
      treeItem.tooltip = file.fsPath;
      treeItem.resourceUri = file;
      items.push(treeItem);
    }

    return items;
  }

  private async getTestActions(parent: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!parent.resourceUri) {
      return [];
    }

    const openAction = new vscode.TreeItem('Open', vscode.TreeItemCollapsibleState.None);
    openAction.command = {
      command: 'regressify.open',
      title: 'Open',
      arguments: [parent.resourceUri],
    };
    openAction.iconPath = new vscode.ThemeIcon('file');
    openAction.contextValue = 'open';

    const referenceAction = new vscode.TreeItem('Reference', vscode.TreeItemCollapsibleState.None);
    referenceAction.command = {
      command: 'regressify.reference',
      title: 'Reference',
      arguments: [parent.resourceUri],
    };
    referenceAction.iconPath = new vscode.ThemeIcon('testing-queued-icon');
    referenceAction.contextValue = 'reference';

    const actions = [openAction, referenceAction];

    const hasReport = await hasTestSuiteReport(parent.resourceUri);

    if (hasReport) {
      const approveAction = new vscode.TreeItem('Approve', vscode.TreeItemCollapsibleState.None);
      approveAction.command = {
        command: 'regressify.approve',
        title: 'Approve',
        arguments: [parent.resourceUri],
      };
      approveAction.iconPath = new vscode.ThemeIcon('testing-passed-icon');
      approveAction.contextValue = 'approve';
      actions.push(approveAction);

      const testAction = new vscode.TreeItem('Test', vscode.TreeItemCollapsibleState.None);
      testAction.command = {
        command: 'regressify.test',
        title: 'Test',
        arguments: [parent.resourceUri],
      };
      testAction.iconPath = new vscode.ThemeIcon('testing-run-icon');
      testAction.contextValue = 'test';
      actions.push(testAction);

      const viewReportAction = new vscode.TreeItem('View Report', vscode.TreeItemCollapsibleState.None);
      viewReportAction.command = {
        command: 'regressify.viewReport',
        title: 'View Report',
        arguments: [parent.resourceUri],
      };
      viewReportAction.iconPath = new vscode.ThemeIcon('test-view-icon');
      viewReportAction.contextValue = 'viewReport';
      actions.push(viewReportAction);
    }

    return actions;
  }
}
