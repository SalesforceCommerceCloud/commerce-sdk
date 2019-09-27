const fs = require("fs-extra");
const Handlebars = require("handlebars");
const path = require("path");

const templateDirectory = `${__dirname}/../../templates`;
const pkgDir = "./pkg";

const clientInstanceTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "ClientInstance.js.hbs"), "utf8")
);

function createClient(webApiModel) {
  let clientCode = clientInstanceTemplate(webApiModel);
  writeClientCode(clientCode);
}

function writeClientCode(clientCode) {
  fs.ensureDirSync(pkgDir);
  fs.writeFileSync(path.join(pkgDir, "shop.js"), clientCode);
}

function copyStaticFiles() {
  fs.ensureDirSync(pkgDir);
  fs.copySync(`${__dirname}/../core`, path.join(pkgDir, "core"));
}

export { createClient, copyStaticFiles };
