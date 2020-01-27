/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";
import { getAllDataTypes } from "./parser";

import {
  getBaseUri,
  getBaseUriParameters,
  isDefinedProperty,
  getDataType,
  isPrimitiveProperty,
  isArrayProperty,
  isObjectProperty,
  getArrayElementTypeProperty,
  getReturnPayloadType,
  getSecurityScheme,
  getValue,
  onlyRequired,
  onlyOptional,
  eachModel,
  isTypeDefinition
} from "./template-helpers";
import {
  WebApiBaseUnit,
  WebApiBaseUnitWithDeclaresModel,
  WebApiBaseUnitWithEncodesModel
} from "webapi-parser";

const templateDirectory = `${__dirname}/../templates`;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("handlebars-helpers")({ handlebars: Handlebars }, [
  "string",
  "comparison"
]);

const operationsPartialTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "operations.ts.hbs"), "utf8")
);

export const clientInstanceTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "ClientInstance.ts.hbs"), "utf8")
);

export const indexTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "index.ts.hbs"), "utf8")
);
/**
 * Handlebar template to export all APIs in a family
 */
export const apiFamilyTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "apiFamily.ts.hbs"), "utf8")
);

/**
 * Handlebar template to export all functions in a API
 */
export const apiIndexTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "apiIndex.ts.hbs"), "utf8")
);

export const renderOperationListTemplate = Handlebars.compile(
  fs.readFileSync(
    path.join(templateDirectory, "operation-list.yaml.hbs"),
    "utf8"
  )
);

export const dtoTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dto.ts.hbs"), "utf8")
);

export function createClient(
  webApiModels: WebApiBaseUnit[],
  boundedContext: string
): string {
  const clientCode: string = clientInstanceTemplate(
    {
      dataTypes: getAllDataTypes(
        webApiModels as WebApiBaseUnitWithDeclaresModel[]
      ),
      models: webApiModels,
      apiSpec: boundedContext
    },
    {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  );
  return clientCode;
}

export function createDto(webApiModels: WebApiBaseUnit[]): string {
  const types = getAllDataTypes(
    webApiModels as WebApiBaseUnitWithDeclaresModel[]
  );
  const dtoCode: string = dtoTemplate(types, {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  });
  return dtoCode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createIndex(boundedContexts: any): string {
  const indexCode: string = indexTemplate({
    apiSpec: boundedContexts
  });
  return indexCode;
}

/**
 * Generates code to export all APIs in a API Family
 * @param apiNames Names of all the APIs in the family
 * @returns code to export all APIs in a API Family
 */
export function createApiFamily(apiNames: string[]): string {
  const code: string = apiFamilyTemplate({
    apiNamesInFamily: apiNames
  });
  return code;
}

/**
 * Generates code to export all functions of a API in index.ts
 * @param apiName Name of the API
 * @returns index.ts code for the given API
 */
export function createApiIndex(apiName: string): string {
  const code: string = apiIndexTemplate({
    apiName: apiName
  });
  return code;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderOperationList(allApis: {
  [key: string]: WebApiBaseUnitWithEncodesModel[];
}): string {
  const renderedOperations: string = renderOperationListTemplate(allApis, {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  });
  return renderedOperations;
}

// Register helpers
Handlebars.registerHelper("getBaseUri", getBaseUri);

Handlebars.registerHelper("getBaseUriParameters", getBaseUriParameters);

Handlebars.registerHelper("isDefinedProperty", isDefinedProperty);

Handlebars.registerHelper("getDataType", getDataType);

Handlebars.registerHelper("isPrimitive", isPrimitiveProperty);

Handlebars.registerHelper("isArrayProperty", isArrayProperty);

Handlebars.registerHelper("isObjectProperty", isObjectProperty);

Handlebars.registerHelper("isTypeDefinition", isTypeDefinition);

Handlebars.registerHelper("getArrayElementType", getArrayElementTypeProperty);

Handlebars.registerHelper("getReturnPayloadType", getReturnPayloadType);

Handlebars.registerHelper("getSecurityScheme", getSecurityScheme);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("getValue", getValue);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("onlyRequired", onlyRequired);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper("onlyOptional", onlyOptional);

Handlebars.registerPartial("operations", operationsPartialTemplate);

Handlebars.registerHelper("eachModel", eachModel);
