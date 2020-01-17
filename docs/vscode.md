# Using VSCODE

## Multi-Workspace Project

At the root of the project you will find a `commerce-sdk.code-workspace` file which includes some basic configuration settings to setup a multi workspace project within vscode.

This will organize the packages within vscode like the following
​
![Workspaces](./images/workspaces.png "Workspaces")

If you workspace bar does not look like this there are a couple of ways to open it.

On is open the `commerce-sdk.code-workspace` in vscode and you will have a button in the lower right to open that workspace

Alternatively you can open it via the cli `$ code commerce-sdk.code-workspace` will directly open the workspace as well.

Monorepo config represents the files at the root of the folder that lets you configure or run the commands in the monorepo itself.

The others workspaces correspond directly with each of the lerna packages.

## Launch configurations

VSCode lets you define launch configurations via json.  I have included some examples below to get people started. 

> NOTE: The below configurations will only work in a multi workspace otherwise ${workspaceFolder} will point to the root of the project and not the root of the workspace
        
### Debugging Code

#### Generator

Often you will need to debug the generator.  Since the following are specific ONLY for the generator you can add them to the launch configuration that is specific for the generator itself

> NOTE: Core and Exchange-connector must already by built for these to work

```json
{
    "type": "node",
    "request": "launch",
    "name": "Gulp task (Local files)",
    "program": "${workspaceFolder}/node_modules/gulp/bin/gulp.js",
    "args": [
        "renderTemplates"
    ],
    "skipFiles": [
        "<node_internals>/**"
    ]
}
```

Note that we are running gulp directly.  This is because when debugging you most likely want to execute the minimum about of code needed for your testing.  So this allows you to target exact tasks to debug them.

But what if you want to troubleshoot a part of the rendering that is happening when downloading the apis from exchange.  Pretty simple to add a launch configuration for that as well

```json
    {
        "type": "node",
        "request": "launch",
        "name": "Gulp task (Download Files)",
        "env": {
            "EXCHANGE_DOWNLOAD": "1"
        },
        "envFile": "${workspaceFolder}/.env",
        "program": "${workspaceFolder}/node_modules/gulp/bin/gulp.js",
        "args": [
            "renderTemplates"
        ],
        "skipFiles": [
            "<node_internals>/**"
        ]
    }
```

As long as you have a .env with your credentials for exchange this will now download from exchange and let your step through to debug as well.


### How do I debug tests

Sometimes you need to debug what a test is doing.  This can also be done and the below can be added as a workspace config as it will work for all workspaces.

Specifically what this lets you do is debug a single test file easily and add breakpoints and watches within that test file

> NOTE: Currently this requires cross-env to be installed globally (Will update at some point)

```json
{
    "type": "node",
    "request": "launch",
    "name": "Debug tests for current file",
    "runtimeExecutable": "cross-env",
    "runtimeArgs": [
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

To read more about debugging in VSCODE you can view that here: https://code.visualstudio.com/docs/editor/debugging

