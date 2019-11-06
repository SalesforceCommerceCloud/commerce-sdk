import { WebApiParser, WebApiBaseUnit } from "webapi-parser";

function processRamlFile(ramlFile: string): Promise<WebApiBaseUnit> {
  return WebApiParser.raml10.parse(`file://${ramlFile}`);
}

export { processRamlFile };
