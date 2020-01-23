# Generator
Generator package is used to generate the commerce-sdk npm package. 

## Usage
To generate SDK clients for all mulesoft exchange, set these environment variables before running the build. 
> **Note:** These are optional parameters. If not provided, local files will be used to generate commerce-sdk. 
​

| Parameter | Description |
| --------- | :----------- |
| EXCHANGE_DOWNLOAD | Boolean flag to download RAML files from mulesoft exchange. |
| ANYPOINT_USERNAME | Mulesoft anypoint exchance username. Shared with SteelArc team using LastPass. |
| ANYPOINT_PASSWORD | Mulesoft anypoint exchance user password. Shared with SteelArc team using LastPass. |
