// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fbsqlcmd from './fbSqlCommands';
import * as gpd from './gepado';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "fbsqlvsc" is now active!');

  gpd.activate();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let buildScript = vscode.commands.registerCommand('fbsqlvsc.buildScript', (uri?:vscode.Uri) => {
    return fbsqlcmd.buildScript(context, uri);
  });
  let execScript = vscode.commands.registerCommand('fbsqlvsc.execScript', (uri?:vscode.Uri) => {
    return fbsqlcmd.execScript(context, uri);
  });

  context.subscriptions.push(buildScript, execScript);
}

// this method is called when your extension is deactivated
export function deactivate() { }