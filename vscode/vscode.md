# Using VSCODE

### Debugging
VSCode lets you define launch configurations via JSON. To debug a file add the example below as a workspace config to any workspace.

Specifically, this allows you to debug a single file easily and add breakpoints and/or watches within the file.

```json
{
    "type": "node",
    "request": "launch",
    "name": "Debug current file",
    "runtimeExecutable": "npx",
    "runtimeArgs": [
        "cross-env",
        "mocha",
        "-r",
        "ts-node/register",
        "--timeout",
        "999999",
        "--colors",
        "${file}"
    ],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen",
    "protocol": "inspector",
    "cwd": "${workspaceFolder}"
}  
```

See [Debugging](https://code.visualstudio.com/docs/editor/debugging) for details on debugging in VSCODE.
