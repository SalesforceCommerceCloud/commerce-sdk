import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";
import { model } from "amf-client-js";
const dataTypeMap = {
  "http://www.w3.org/2001/XMLSchema#string": "string",
  "http://www.w3.org/2001/XMLSchema#integer": "number"
};
const ANY = "any";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("handlebars-helpers")({ handlebars: Handlebars }, [
  "string",
  "comparison"
]);

const templateDirectory = `${__dirname}/../../templates`;

const clientInstanceTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "ClientInstance.ts.hbs"), "utf8")
);

export const mapToTypeScriptDataType = function(dataType: any): string {
  if (!dataType || !dataType.value) {
    return ANY;
  }
  return dataTypeMap[dataType.value()] ? dataTypeMap[dataType.value()] : ANY;
};

Handlebars.registerHelper("getDataType", mapToTypeScriptDataType);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("getValue", function(name: any): string {
  return name.value();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("onlyRequired", function(classes: any[]): any[] {
  return !classes
    ? []
    : classes.filter(entry => {
        return entry.minCount.value() > 0;
      });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("onlyOptional", function(classes: any[]): any[] {
  return !classes
    ? []
    : classes.filter(entry => {
        return entry.minCount.value() == 0;
      });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("isOptional", function(item: any): boolean {
  return (item.value() as number) === 0;
});

const indexTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "index.ts.hbs"), "utf8")
);

const dtoTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dto.ts.hbs"), "utf8")
);

export function createClient(webApiModel: model.domain.DomainElement): string {
  const clientCode: string = clientInstanceTemplate(webApiModel);
  return clientCode;
}

export function createDto(webApiModel: model.domain.DomainElement[]): string {
  const dtoCode: string = dtoTemplate(webApiModel as model.domain.ClassTerm[]);
  return dtoCode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createIndex(boundedContexts: any): string {
  const indexCode: string = indexTemplate({
    apiSpec: boundedContexts
  });
  return indexCode;
}
