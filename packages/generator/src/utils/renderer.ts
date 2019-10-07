const fs = require("fs-extra");
const Handlebars = require("handlebars");
// Load additional helper functions for Handlebars
require("handlebars-helpers")({ handlebars: Handlebars }, ["comparison"]);
const path = require("path");

const templateDirectory = `${__dirname}/../../templates`;
const pkgDir = "./pkg";

const clientInstanceTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "ClientInstance.js.hbs"), "utf8")
);

const indexTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "index.js.hbs"), "utf8")
);

function createClient(webApiModel: any, context: any): void {
  let clientCode = clientInstanceTemplate(webApiModel);
  writeCode(clientCode, `${context}.js`);
}

function createIndex(boundedContexts: any): void {
  let indexCode = indexTemplate({
    apiSpec: boundedContexts
  });
  writeCode(indexCode, "index.js");
}

function writeCode(clientCode: any, filename: string) : void {
  fs.ensureDirSync(pkgDir);
  fs.writeFileSync(path.join(pkgDir, filename), clientCode);
}

export { createClient, createIndex };
