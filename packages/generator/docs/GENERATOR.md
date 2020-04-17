# Generator

> **Note:** This readme is here to allow a spot for the commerce-sdk readme to be in the root of the package.

* Templates are rendered into the renderDir specified by [build-config.ts](../../../build-config.ts)
* Once rendered they are transpiled to the dist directory just like every other package

## Usage

### Using real endpoints

> By default *ALL* build commands use local files for testing purposes. In order to build the actual SDK you need to run the build with the environmental variable of `EXCHANGE_DOWNLOAD` set to `1`

For example
```bash
  # To build sdk
  EXCHANGE_DOWNLOAD=1 npm run build
```
Additionally you need credentials for exchange to download the APIs.  This can be found in a .env file or in your environmental configuration.

For example
```
ANYPOINT_USERNAME=<username>
ANYPOINT_PASSWORD=<password>
```

### Building the SDK

Simply run `npm run build`

> NOTE: Core and Exchange-Connector must already be built 

In the backend this is running a bunch of gulp tasks to accomplish this.

### Build Operation List

> NOTE: Core and Exchange-Connector must already be built 

Another option is to build a list of operations. Simply run `npm run buildOperationList` to build a list of operations

You can then find this list at `renderedTemplates/operationList.yaml`

## Logging
Default log level of the Generator is INFO. Generator uses [loglevel](https://www.npmjs.com/package/loglevel) npm package. So all the log levels supported by [loglevel](https://www.npmjs.com/package/loglevel) package are supported in Generator.

To change the loglevel, set the log level in environment variable
```
SDK_GENERATOR_LOG_LEVEL=debug
```

## Dependencies 

Dependencies here are used for 2 different things, generation and the sdk itself.  This is an important distinction devDependencies are not distributed.

  * All devDependencies are used for the code generation only
  * All dependencies are used for the commerce-sdk itself



