import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Running extension tests.');

  test('Extension should be present', () => {
    assert.ok(
      vscode.extensions.getExtension('sethssoftware.storybook-view'),
      'Extension sethssoftware.storybook-view should be installed'
    );
  });

  test('All commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);

    const expected = [
      'storybookview.openPreview',
      'storybookview.startStorybook',
      'storybookview.stopStorybook',
      'storybookview.openStorybook',
      'storybookview.refreshPreview',
    ];

    for (const cmd of expected) {
      assert.ok(commands.includes(cmd), `Command '${cmd}' should be registered`);
    }
  });

  test('Configuration should have expected defaults', () => {
    const config = vscode.workspace.getConfiguration('storybookview');
    assert.strictEqual(config.get('port'), 6006);
    assert.strictEqual(config.get('inactivityTimeout'), 5);
    assert.strictEqual(config.get('storybookPath'), '');
  });
});
