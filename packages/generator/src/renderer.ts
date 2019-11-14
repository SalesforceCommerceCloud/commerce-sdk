import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";
import { model } from "amf-client-js";

import {
  isDefinedProperty,
  getDataType,
  isPrimitiveProperty,
  isArrayProperty,
  isObjectProperty,
  getArrayElementTypeProperty,
  getReturnPayloadType,
  getSecurityScheme,
  isReturnPayloadDefined,
  getValue,
  onlyRequired,
  onlyOptional
} from "./template-helpers";

const templateDirectory = `${__dirname}/../templates`;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("handlebars-helpers")({ handlebars: Handlebars }, [
  "string",
  "comparison"
]);

export const clientInstanceTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "ClientInstance.ts.hbs"), "utf8")
);

export const indexTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "index.ts.hbs"), "utf8")
);

export const dtoTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dto.ts.hbs"), "utf8")
);

export function createClient(webApiModel: any, boundedContext: string): string {
  const clientCode: string = clientInstanceTemplate({
    model: webApiModel,
    apiSpec: boundedContext
  });
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

// Register helpers
Handlebars.registerHelper("isDefinedProperty", isDefinedProperty);

Handlebars.registerHelper("getDataType", getDataType);

Handlebars.registerHelper("isPrimitive", isPrimitiveProperty);

Handlebars.registerHelper("isArrayProperty", isArrayProperty);

Handlebars.registerHelper("isObjectProperty", isObjectProperty);

Handlebars.registerHelper("getArrayElementType", getArrayElementTypeProperty);

Handlebars.registerHelper("getReturnPayloadType", getReturnPayloadType);

Handlebars.registerHelper("getSecurityScheme", getSecurityScheme);

Handlebars.registerHelper("isReturnPayloadDefined", isReturnPayloadDefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("getValue", getValue);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("onlyRequired", onlyRequired);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("onlyOptional", onlyOptional);
