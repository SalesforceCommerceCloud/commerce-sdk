# commerce-sdk

Salesforce Commerce Node.js SDK

[![CircleCI][circleci-image]][circleci-url]

## What is This?

commerce-sdk is a Node.js SDK for Salesforce Commerce. It provides easy access to the Salesforce Commerce platform RESTful APIs.

It is a mono repo containing the tools needed to be a rockstar commerce developer on the Salesforce Commerce platform.

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

### Additional Documentation

[Using VSCODE](./docs/vscode.md)
[Code Generation](./packages/generator/docs/GENERATOR.md)


<!-- Markdown link & img dfn's -->
[circleci-image]: https://circleci.com/gh/SalesforceCommerceCloud/commerce-sdk.svg?style=svg&circle-token=c68cee5cb20ee75f00cbda1b0eec5b5484c58b2a
[circleci-url]: https://circleci.com/gh/SalesforceCommerceCloud/commerce-sdk

