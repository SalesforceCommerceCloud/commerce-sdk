const fs = require("fs-extra");
const Handlebars = require("handlebars");
const path = require("path");

const templateDirectory = `${__dirname}/../../templates`;
const pkgDir = "./pkg";

const clientInstanceTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "ClientInstance.js.hbs"), "utf8")
);

const indexTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "index.js.hbs"), "utf8")
);

function createClient(webApiModel, context) {
  let clientCode = clientInstanceTemplate(webApiModel);
  writeCode(clientCode, `${context}.js`);
}

function createIndex(boundedContexts) {
  let indexCode = indexTemplate({
    apiSpec: boundedContexts
  });
  writeCode(indexCode, "index.js");
}

function writeCode(clientCode, filename) {
  fs.ensureDirSync(pkgDir);
  fs.writeFileSync(path.join(pkgDir, filename), clientCode);
}

function copyStaticFiles() {
  fs.ensureDirSync(pkgDir);
  fs.copySync(`${__dirname}/../core`, path.join(pkgDir, "core"));
}

export { createClient, createIndex, copyStaticFiles };
