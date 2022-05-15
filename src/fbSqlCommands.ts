import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

let extensions = [
  {
    ext: 'xss',
    name: 'XML SQL Script file'
  }
];
const scriptPlayer = 'fbsqlplay.exe';
const shellPath = 'cmd.exe';
let terminalName = 'FBSQL';

/**
 * @description .
 * @param fsPath .
 * @returns .
 */
function exists(fsPath: string): boolean {
  return Boolean(fsPath && fs.existsSync(fsPath));
}

/**
 * @description Gets the URI of the current document in the VS Code editor.
 * @returns {vscode.Uri | undefined}
 */
function getCurrentDocUri(): vscode.Uri | undefined {
  const editor = vscode.window.activeTextEditor;

  return editor ? editor.document.uri : undefined;
}

/**
 * @description Gets the script folder for an universal resource identifier.
 * @param uri The URI of a file or folder which is located in the script 
 * folder.
 * @returns {string | undefined}
 */
function getScriptFolder(uri?: vscode.Uri): string | undefined {
  if (uri) {
    const match = uri.fsPath.match(/.*(\.xss$|\.gpd$|\.xss[\/,\\]|\.gpd[\/,\\])/) || [''];
    const folderPath = match[0].replace(/\\$/, '');

    if (folderPath && isDir(folderPath)
      && isScriptExtension(path.extname(folderPath))
      && isDir(path.join(folderPath, 'script'))) {
      return folderPath;
    }
  }

  return undefined;
}

/**
 * @description Checks if fsPath an exists directory.
 * @param {string} fsPath The file system path to be checked.
 * @returns {boolean}
 */
function isDir(fsPath: string): boolean {
  return exists(fsPath) && fs.lstatSync(fsPath).isDirectory();
}

/**
 * @description Checks whether fsPath references an existing file.
 * @param {string} fsPath The file system path to be checked.
 * @returns {boolean}.
 */
function isFile(fsPath: string): boolean {
  return exists(fsPath) && fs.lstatSync(fsPath).isFile();
}

/**
 * @description Checks whether it is a valid extension for an FBSQL script.
 * @param extension The extension name including the leading dot.
 * @returns {boolean}
 */
function isScriptExtension(extension: string): boolean {
  extension = extension?.toLowerCase() || '.';

  return extensions.findIndex((value) => {
    return extension === '.' + value.ext;
  }) >= 0;
}

/**
 * @description Checks whether fsPath references an existing FBSQL script file.
 * @param {string} fsPath The file system path to be checked.
 */
function isScriptFile(fsPath: string): boolean {
  return isFile(fsPath) && isScriptExtension(path.extname(fsPath));
}

/**
 * @description Builds a FBSQL script file for a folder in a terminal.
 * @param context A vscode.ExtensionContext instance.
 */
export function buildScript(context: vscode.ExtensionContext
  , uri?: vscode.Uri) {
  const workspaceFolders = vscode.workspace?.workspaceFolders;

  if (workspaceFolders) {

    uri = uri || getCurrentDocUri();

    if (uri) {
      if (!isScriptFile(uri.fsPath)) {
        const config = vscode.workspace.getConfiguration('FBSQL', uri);
        const silentMode = config['silentMode'];
        const scriptPath = getScriptFolder(uri);

        if (scriptPath) {
          const playerPath = path.join(context.extensionPath, 'bin', scriptPlayer);
          const cmd = `"${playerPath}" "${scriptPath}" /b`
            + (silentMode ? ' /s' : '');
          const terminal = vscode.window.createTerminal(terminalName, shellPath);

          terminal.show();
          terminal.sendText(cmd);

          if (silentMode) {
            terminal.sendText('if not %errorlevel%==0 pause');
            terminal.sendText('exit');
          }

          return;
        }
      }
    }

    return vscode.window.showErrorMessage(`Invalid FBSQL script folder ${uri?.fsPath}.`);
  }
  else {
    return vscode.window.showErrorMessage('Please open a FBSQL script project folder first.');
  }
}

/**
 * @description Executes a FBSQL script file/folder in a terminal.
 * @param context A vscode.ExtensionContext instance.
 * @param uri .
 * @returns {any}
 */
export function execScript(context: vscode.ExtensionContext, uri?: vscode.Uri): any {
  const workspaceFolders = vscode.workspace?.workspaceFolders;

  if (workspaceFolders) {
    uri = uri || getCurrentDocUri() || workspaceFolders[0].uri;
    let scriptPath = uri.fsPath || undefined;

    if (!isScriptFile(scriptPath || '')) {
      scriptPath = getScriptFolder(uri);
    }

    if (scriptPath) {
      const config = vscode.workspace.getConfiguration('FBSQL', uri);
      const playerPath = path.join(context.extensionPath, 'bin', scriptPlayer);
      const configFile = config['configFile'];
      const configJPath = config['configJpath'] || '$';
      const logPath = config['logDisable']
        ? false : config['logPath'] || os.tmpdir();
      const silentMode = config['silentMode'];

      const cmd = `"${playerPath}" "${scriptPath}" /c:"${configFile}"`
        + (configJPath !== '$' ? ` /p:"${configJPath}"` : '')
        + (logPath ? ` /l:"${logPath}"` : '')
        + (config['beep'] ? ' /a' : '')
        + (config['logDelete'] ? ' /d' : '')
        + (silentMode ? ' /s' : '');

      const terminal = vscode.window.createTerminal(terminalName, shellPath);

      terminal.show();
      terminal.sendText(cmd);

      if (silentMode) {
        terminal.sendText('if not %errorlevel%==0 pause');
        terminal.sendText('exit');
      }
    } else {
      return vscode.window.showErrorMessage(`Invalid FBSQL script file or folder ${uri.fsPath}.`);
    }
  } else {
    return vscode.window.showErrorMessage('Please open a FBSQL script project folder first.');
  }
}

/**
 * @description Registers a new file/folder extension for script files/folders.
 * @param extension An extension without the dot.
 * @param name A description for the extension.
 */
export function registerExtension(extension: string, name: string): void {
  extension = extension.toLowerCase();

  if (extension && extensions.findIndex((value) => {
    return extension === value.ext;
  }) < 0) {
    extensions.push({
      ext: extension,
      name: name
    });
  }
}

/**
 * @description Sets the name for the used terminals to display in VS code.
 * @param name The name for the terminal.
 */
export function setDefaultTerminalName(name: string): void {
  terminalName = name;
}

