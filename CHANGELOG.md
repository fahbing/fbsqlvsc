# Change Log

## 0.3.11 - November 20, 2022
- disableAutoClose option to prevent the automatic closing of the terminal session after successful script execution in silent mode
- includes FBSQL Command Line Script Player, Version 1.0.32
  - introduction of a compatibility level condition (TSQL only) for step and batch nodes
  - now a message is printed when the transaction has been rolled back on the server side
  - ignore files and directories that starts with an underline
  - inner exception messages are appended to the last ones, separated by line breaks
  - title fix for steps and nodes, if there is no name attribute in the XML, then this is derived from the file or directory name, as with completely missing XML.
  - build script command exit code fix, a value greater than 0 is returned if an error occurred

## 0.3.10 - August 21, 2022
- includes FBSQL Command Line Script Player, Version 1.0.31
  - for commands that are not executed in a transaction, no warning is output, only an info text
  - if the execution of a folder script fails, the URI of the step file is now output after the error message, ctrl+click opens the file
  - the default exit code for an error is now 1 (previously -1)

## 0.2.9 - August 5, 2022
- includes FBSQL Command Line Script Player, Version 1.0.30
  - command is no longer processed from a select statement - fix

## 0.2.8 - May 15, 2022
- the building and execution of a script is now also possible from the explorer context menu
- a script folder no longer needs to be a workspace folder and can also be located within it
- the setting for "silent mode" now also applies to script building
- includes FBSQL Command Line Script Player, Version 1.0.29
  - support of encrypted placeholders

## 0.2.7 - April 24, 2022
- includes FBSQL Command Line Script Player, Version 1.0.28
  - the command timeout setting now also applies to COMMIT and ROLLBACK
  - supports the building of the script file from a script folder

## 0.1.6 - December 15, 2021
- includes FBSQL Command Line Script Player, Version 0.9.27
