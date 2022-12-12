# fbsqlvsc

An extension to implement the FBSQL Command Line Script Player (fbsqlplay.exe).

**Commands:**
- Build FBSQL script - builds a script file from a script folder, which is created or replaced in the script root under the name **script.xss**
- Execute FBSQL script - executes a script folder or file

![explorer context menu](images/context_menu.png)

In VS Code explorer, if a folder or file in an FBSQL script folder is selected, the **Build** and **Execute** commands are offered on the context menu. If a script file (.xss) is selected, only the **Execute** command is available.
Both commands can also be executed by the Command Palette if the above criteria can be applied to the file currently selected in the editor.


## Requirements
- VS Code 1.70.0 or higher
- .Net Framework 4.7.2


## Offline Installation

``` ps
code --install-extension fbsqlvsc-0.3.11.vsix
```

## Extension settings

| Setting ID | description |
| --- | --- |
| FBSQL.beep | Beeps when the script run has finished. |
| FBSQL.configFile | Specifies the folder path containing the config file for the script player. |
| FBSQL.configJpath | Specifies the json path to the section in the config file for the script player. |
| FBSQL.disableAutoClose | Prevents the automatic closing of the terminal session after successful script execution in silent mode. |
| FBSQL.logDelete | Deletes the log file after a successful script run. |
| FBSQL.logDisable | Disables output to a log file. |
| FBSQL.logPath | Specifies the path to output the log file. If only a directory is specified, the file name is concated from the "SQL_" prefix, the machine name, and the current time, e.g. SQL_SERVER01_2022_05_20_23_15_18_588.log. If the value is empty, the automatically named log file is output in the Temp folder of the current user. |
| FBSQL.silentMode | Enables the 'silent mode' script execution mode, no further input is expected. | 


## About the FBSQL Script

An FBSQL script is an XML-formatted text file in which SQL commands are arranged in a tree structure.
This makes it possible to manage complex SQL scripts clearly. For example, individual statements or even complete branches in the script can be excluded from execution by deactivation.
The first version dates back to 2006 and was developed in Object Pascal.

It wasn't until 2012 that a folder-based script format was developed for use in a Git repository. This can be converted into a script file and back into a folder-based script.
From the beginning, FBSQL scripts supported the definition and use of placeholders. Placeholder are strings whose occurrences are replaced in all commands. These are often used to adjust database names and file paths to a central point in the script.

Since 2021, these can now also be assigned in an external JSON formated configuration file. In 2022, the possibility of storing encrypted strings in placeholders was developed.

### The script file (.xss)

The full SQL script is saved in an XML-formatted text file, using UTF-8 encoding without a byte-order mark (BOM).
The extension "xss" stands for **X**ML **S**ql **S**cript.

#### The script element 

A **script** element contains a **version** element whose attributes return the version number of the script, and a **batch** element that serves as the root for other **batch** and ** step** elements.

##### Attributes of the **script** element

| Attribute | Description | Default |
| --- | --- | --- |
| version | Required string attribute. The version of the FBSQL Script, currently "4.0". |  |
| sqllanguage | Optional string attribute. Used for backwards compatibility for the syntax highlighting color settings in the old desktop application ("TSQL" - similar to MS SQL Server Management Studio or "MySQL" - as in MySQL Workbench). | TSQL |

#### The **version** element

Defines the version number of the script, consisting of major, minor, release and build number.

##### Attributes of the **version** element

| Attribute | Description | Default |
| --- | --- | --- |
| major  | Required integer attribute. The major version number. |  |
| minor | Required integer attribute. The minor version number. |  |
| release | Required integer attribute. The release number. |  |
| build | Required integer attribute. The build number. |  |


#### The **batch** element 

The <batch> element serves as a container for other subordinate **batch** or **step** elements. By using **batch** elements, work steps can be grouped and large scripts can be designed more clearly.

##### Attributes of the **batch** element

| Attribute | Description | Default |
| --- | --- | --- |
| name | Required string attribute. The name of the batch. |  |
| executable | Optional boolean attribute. If executable is false, all **batch** and **step** child elements are ignored during script execution. | false |
| expanded | Optional boolean attribute. Used for backwards compatibility for the old desktop application and specifies whether the batch node should be expanded (true) or collapsed (false). | false |

#### The step element 

A **step** element encloses one or more SQL statements.

##### Attributes of the **step** element

| Attribute | Description | Default |
| --- | --- | --- |
| name | Required string attribute. The name of the step. |  |
| executable | Optional boolean attribute. If executable is false the step is ignored during script execution. | false |
| tsql_compLevel | Optional string attribute. Consisting of a comparison operator (">", ">=", "=", "<=", "<" or "<>" [alternate "!="]) and the compatibility level of a SQL server database. Determines whether the execution of the step depends on the compatibility level of the database. If a step is only to be executed from compatibility level 130 (SQL Server 2016), the correct attribute value would be "&amp;gt;=130". |  |

``` xml
<?xml version="1.0" encoding="utf-8"?>
<script version="4.0" sqllanguage="TSQL">
  <version major="1" minor="0" release="1" build="2" />
  <batch name="Test database 1.0.1" executable="true">
    <step name="connect" executable="true">
      CONNECT ...
    </step>
    <batch name="tables" executable="true">
      <step name="create table A" executable="true">
        CREATE TABLE ...
      </step>
      <step name="create table B" executable="true">
        CREATE TABLE ...
      </step>
    </batch>
  </batch>
</script>
```

### The folder-based script

A folder-based script allows managing FBSQL scripts in a Git repository. Instead of one big script file, folders are used for **batch** and sql files for **step** elements. If required, a single XSS file can be built from the folder-based format for distribution to a customer.

#### The folder-based batch element

A batch element corresponds to a directory. All contained .sql files are interpreted as steps and all directories as child batch element.
By default, all files and folders are sorted alphabetically into a batch element. By prefixing a sequence of four digits followed by a hyphen, you can influence the sorting.
The file system arrangement specified in the example ...

  - 0200-b_folder
  - a_folder
  - c_folder
  - 0100-b_file
  - a_file
  - c_file

... would result in the following arrangement in the script.

  - b_file
  - b_folder
  - a_file
  - a_folder
  - c_file
  - c_folder

If a folder contains a file named **__batch.xml**, it can overwrite the **name** of the node for the script. This can also contain characters that are not allowed in the file system. You can also set the properties **executable** and **expanded**. Both are Boolean values (**true** or **false**). The **expanded property** does not matter to the command line version of the script player.
Folders starting with an underscore are not considered part of the script.

``` xml
<?xml version="1.0" encoding="utf-8"?>
<batch name="replace \ with /" executable="false" expanded="true" />
```

##### Attributes of the folder-based **batch** element

| Attribute | Description | Default |
| --- | --- | --- |
| name | Optional string attribute. The name of the batch. | _The folder name without sort-prefix._ |
| executable | Optional boolean attribute. If executable is false, all **batch** and **step** child elements are ignored during script execution. | true |
| expanded | Optional boolean attribute. Used for backwards compatibility for the old desktop application and specifies whether the batch node should be expanded (true) or collapsed (false). | false |


#### The folder-based step element

A step element corresponds to a text file with the extension **.sql**. This can contain one or more commands.
SQL files starting with an underscore are not considered part of the script. In the first line, the attributes for this step can optionally be specified in a single-line commented step element.

``` tsql
-- <step name="replace \ with /" executable="false" />
```

##### Attributes of the folder-based step element

| Attribute | Description | Default |
| --- | --- | --- |
| name | Optional string attribute. The name of the step. | _The file name without sort-prefix and extension._ |
| executable | Optional boolean attribute. If executable is false the step is ignored during script execution. | true |
| tsql_compLevel | Optional string attribute. Consisting of a comparison operator (">", ">=", "=", "<=", "<" or "<>" [alternate "!="]) and the compatibility level of a SQL server database. Determines whether the execution of the step depends on the compatibility level of the database. If a step is only to be executed from compatibility level 130 (SQL Server 2016), the correct attribute value would be "&amp;gt;=130". |  |

### FBSQL script specific commands

#### CONNECT
Establishes a connection to the database server. 
The type of database connection is defined via the provider parameter in the connection string.

syntax:
```
CONNECT 'Provider={provider};{connectionstring}'
```

##### Provider **sqlclient**
Connects to a SQL Server database. For backward compatibility, "sqloledb.1" is also accepted. 

For information on a connection string for SQL Server, see:
https://learn.microsoft.com/en-us/dotnet/api/system.data.sqlclient.sqlconnection.connectionstring

```TSQL
CONNECT 'Provider=sqlclient;Data Source=.\MSSQL2016;Initial Catalog=DEVDB;Integrated Security=SSPI';
```

##### Provider **odbc**
Connects to an ODBC data source. For backward compatibility, "msdasql.1" is also accepted. 

For information on a connection string for ODBC, see:
https://learn.microsoft.com/en-us/dotnet/api/system.data.odbc.odbcconnection.connectionstring

_This provider setting is still in the experimental stage!_

```TSQL
CONNECT 'Provider=odbc;DSN=DEVDB_over_ODBC';
```

##### other Provider
Connects over an OLE DB driver to a database. In this case, in contrast to the other connection types, the provider is passed internally to the connection object as part of the connection string.

For information on an OLE DB connection string, see:
https://learn.microsoft.com/en-us/dotnet/api/system.data.oledb.oledbconnection.connectionstring

_This provider setting is still in the experimental stage!_

```TSQL
CONNECT 'Provider=SQLOLEDB;Data Source=.\MSSQL2016;Initial Catalog=DEVDB;Integrated Security=SSPI';
```

#### COMMIT
Triggers a COMMIT for the current transaction and automatically starts a new one upon successful completion.


#### ROLLBACK
Triggers a ROLLBACK for the current transaction and then starts a new one.


#### SET PLACEHOLDER 

Defines a placeholder and its value. If the placeholder already exists, only the value is reassigned. Placeholder names are any string of characters that are searched for in each command and any occurrences found are replaced with the value of the placeholder.
Therefore, the name of a placeholder should be chosen carefully so that it cannot be accidentally replaced in the wrong place.

```tsql
SET PLACEHOLDER '{placeholder_name}' '{placeholder_value}';
```

Of course, placeholders can be misused to insert injection code. However, since the script player is intended as a tool for use in a highly administrator-controlled environment, both the script and the configuration file are in the hands of the administrator himself. Protection against code injection is also the reason that the Access to encrypted placeholders cannot be transferred to other user accounts.

example:
```tsql
SET PLACEHOLDER '$server$'         '.';
SET PLACEHOLDER '$instance$'       '\MSSQL2016';
SET PLACEHOLDER '$dbname$'         'DEVDB';
SET PLACEHOLDER '$fileStreamPath$' 'C:\Program Files\Microsoft SQL Server\MSSQL13.DEV2016\MSSQL\DATA\';

GO

CONNECT 'Provider=SQLOLEDB.1;Integrated Security=SSPI;Initial Catalog=master;Data Source=$server$$instance$';

GO

USE master

GO

IF (EXISTS(SELECT *
             FROM sys.databases 
            WHERE name = N'$dbname$'
              AND is_read_committed_snapshot_on = 0))
  ALTER DATABASE $dbname$ SET READ_COMMITTED_SNAPSHOT ON

GO

USE $dbname$

GO
```


#### SET TERM 
Specifies a new terminator character or string.
```tsql
SET TERM $$
```

#### SET TIMEOUT 
Sets a new timeout (in seconds) for a SQL command. A value of 0 means an unlimited wait time.


#### STOPTRANSACTION
Stops the current transaction. COMMIT should be called beforehand, otherwise a ROLLBACK will be performed automatically.
This command was introduced to allow SQL commands that cannot be executed within a user transaction.
The following message is issued for each command as long as no transaction is active.
```log
-- info: No transaction is currently active.
```


#### STARTTRANSACTION
Starts a new transaction.
```tsql
STARTTRANSACTION;
```


## About the FBSQL Command Line Script Player
