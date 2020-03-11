# commerce-sdk

Salesforce Commerce Node.js SDK

[![CircleCI][circleci-image]][circleci-url]

## What is This?

A mono repo containing packages that generate the Salesforce Commerce SDK. Read more about the SDK [here](./packages/generator/README.md) and the tools in this toolkit in the [Packages](#packages) section.

Visit the [Commerce Cloud Developer Center](https://developer.commercecloud.com/) to learn more about Salesforce Commerce. The developer center has API documentation, getting started guides, community forums, and more.

## Packages

### commerce-sdk

The generator package is responsible for generating the SDK from RAML files. Since the SDK is generated it is not a part of any repository. Read more about the SDK [here](./packages/generator/README.md) and how the generator works [here](./packages/generator/docs/GENERATOR.md).

### @commerce-apps/core

The Core package represents the core functions that call the APIs and interact with Salesforce Commerce. It is used by the SDK. Read more about the core package [here](./packages/generator/README.md).

### @commerce-apps/exchange-connector

The exchange-connector package downloads RAML files from Anypoint Exchange to build the SDK. It is used by the generator but not the generated SDK. Read more about the exchange-connector package [here](./packages/exchange-connector/README.md).

## Setup

All of these commands can be run from either the repo root or the package root.

    # To setup
    npm install

    # To build
    npm run build

## Running Tests
> **Note:** Instructions in the Setup section are prerequisites for this section

To run tests in all the packages, execute
```bash
npm test
```
To print the detailed test results and errors on the console, execute
```bash
npm run test:debug
```
To run tests in the core package only, execute
```bash
npm run test:core
```
To run tests in the exchange-connector package only, execute
```bash
npm run test:ec
```
To run tests in the generator package only, execute
```bash
npm run test:generator
```

These commands will fail if a minimum of 80% coverage is not maintained per source file. Certain files may show 0% coverage in the report when the file does not include testable statements (i.e. files that only contain an interface). These files will not trigger a failure. The coverage is generated using [nyc](https://www.npmjs.com/package/nyc). The configuration is stored within the package.json of each package.

## Issues

First, check the [open issues](https://github.com/SalesforceCommerceCloud/commerce-sdk/issues) and [Commerce Cloud Developer Center](https://developer.commercecloud.com/) for any open issues related to the issue that you are experiencing. If not already raised please file a new issue [here](https://github.com/SalesforceCommerceCloud/commerce-sdk/issues/new) with all the necessary details. If you require an urgent resolution to your issue please ask your AM/CSM to file a support ticket with Salesforce Commerce.

## Contributing

If you would like to contribute please take a look at our [contributors' guide](./Contributing.md).

## Additional Documentation

[Using VSCODE](./docs/vscode.md)  
[Code Generation](./packages/generator/docs/GENERATOR.md)  
[API Documentation](./packages/generator/APICLIENTS.md)  


<!-- Markdown link & img dfn's -->
[circleci-image]: https://circleci.com/gh/SalesforceCommerceCloud/commerce-sdk.svg?style=svg&circle-token=c68cee5cb20ee75f00cbda1b0eec5b5484c58b2a
[circleci-url]: https://circleci.com/gh/SalesforceCommerceCloud/commerce-sdk

