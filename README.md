# vscode-grepdef

This is an extension for [vscode](https://code.visualstudio.com/) that integrates [grepdef](https://github.com/sirbrillig/grepdef): search for symbol definitions in various programming languages

## Features

GrepDef can be used like "Go to definition", except that instead of using a language server, it just greps for the definition. This is less accurate but often faster on large projects.

![GrepDef example](https://github.com/sirbrillig/vscode-grepdef/blob/master/images/vscode-grepdef-example.gif)

There is a context menu as well as two commands that will show up in the Command Palette:

- `GrepDef: Grep for the definition of the symbol under the cursor` which is the same as the context menu.
- `GrepDef: Grep for the definition of a symbol` which will prompt for a symbol.

## Commands

This installs two commands:

- `vscode-grepdef.grepdef`: Grep for the definition of a symbol
- `vscode-grepdef.grepdefword`: Grep for the definition of the symbol under the cursor

## Requirements

You must have [grepdef](https://github.com/sirbrillig/grepdef) installed (version 2.0 or newer).

## Extension Settings

This extension contributes the following settings:

* `vscode-grepdef.grepdefPath`: The path to the `grepdef` executable. Defaults to just using `grepdef` which should work if it is installed globally.