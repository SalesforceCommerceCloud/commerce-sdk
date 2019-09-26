const wap = require("webapi-parser").WebApiParser;

async function processRamlFile(ramlFile) {
  return new Promise(function(resolve, reject) {
    return wap.raml10
      .parse(`file://${ramlFile}`)
      .then(model => {
        resolve(model);
      })
      .catch(reject);
  });
}

module.exports = {
  generate: processRamlFile
};
