const wap = require("webapi-parser").WebApiParser;

function processRamlFile(ramlFile: string): any {
  return wap.raml10.parse(`file://${ramlFile}`);
}

export { processRamlFile };
