const wap = require("webapi-parser").WebApiParser;

function processRamlFile(ramlFile) {
  return wap.raml10.parse(`file://${ramlFile}`);
}

export { processRamlFile };
