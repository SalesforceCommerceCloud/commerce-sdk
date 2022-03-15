# Commerce SDK Examples

This directory contains example usage of the Commerce SDK. Each example contains valid credentials for a public demo instance. The examples can be executed successfully as-is, or you can edit them to provide your own credentials.

> **WARNING:** When creating your own code, _do not_ store secrets as plaintext. Please store secrets in a secure location.

To execute an example using the latest release of the Commerce SDK, run the following code.

```sh
EXAMPLE='01-guest-shopper-auth-token.ts' # Substitute any example file
curl https://raw.githubusercontent.com/SalesforceCommerceCloud/commerce-sdk/master/examples/$EXAMPLE > $EXAMPLE
npm install commerce-sdk
npx ts-node $EXAMPLE
```

To build the SDK from source and execute an example, run the following code.

```sh
EXAMPLE='01-guest-shopper-auth-token.ts' # Substitute any example file
git clone https://github.com/SalesforceCommerceCloud/commerce-sdk
cd commerce-sdk
npm install
npm run build
cd examples
npm install
npx ts-node $EXAMPLE
```