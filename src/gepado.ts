import * as fbsqlcmd from './fbSqlCommands';


/**
 * @description Activates a Gepado specific configuration for the FBSQL
 * extension.
 */
export function activate(): void {
  fbsqlcmd.setDefaultTerminalName('FBSQL for Gepado');
  fbsqlcmd.registerExtension('gpd', 'Gepado SQL script file');
  fbsqlcmd.registerExtension('ddg', 'Gepado SQL script file (old)');
}