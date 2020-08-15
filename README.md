# vscode-grepdef

This is an extension for [vscode](https://code.visualstudio.com/) that integrates [grepdef](https://github.com/sirbrillig/grepdef): search for symbol definitions in various programming languages

## Features

GrepDef can be used like "Go to definition", except that instead of using a language server, it just greps for the definition. This is less accurate but often faster on large projects.

![GrepDef example](images/vscode-grepdef-example.gif)

There is a context menu as well as two commands that will show up in the Command Palette:

- `GrepDef: Grep for the definition of the symbol under the cursor` which is the same as the context menu.
- `GrepDef: Grep for the definition of a symbol` which will prompt for a symbol.

## Requirements

You must have [grepdef](https://github.com/sirbrillig/grepdef) installed.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something
