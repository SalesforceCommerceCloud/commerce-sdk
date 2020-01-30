/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";
import { getAllDataTypes, processApiFamily, getApiName } from "./parser";

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
import _ from "lodash";

const templateDirectory = `${__dirname}/../templates`;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("handlebars-helpers")({ handlebars: Handlebars }, [
  "string",
  "comparison"
]);

const operationsPartialTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "operations.ts.hbs"), "utf8")
);

const clientInstanceTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "ClientInstance.ts.hbs"), "utf8")
);

const indexTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "index.ts.hbs"), "utf8")
);
/**
 * Handlebar template to export all APIs in a family
 */
const apiFamilyTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "apiFamily.ts.hbs"), "utf8")
);

export const renderOperationListTemplate = Handlebars.compile(
  fs.readFileSync(
    path.join(templateDirectory, "operation-list.yaml.hbs"),
    "utf8"
  )
);

const dtoTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dto.ts.hbs"), "utf8")
);

function createClient(
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

function createDto(webApiModels: WebApiBaseUnit[]): string {
  const types = getAllDataTypes(
    webApiModels as WebApiBaseUnitWithDeclaresModel[]
  );
  return dtoTemplate(types, {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  });
}

/**
 * Generates code to export all API families to index.ts
 * @param boundedContexts
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createIndex(boundedContexts: any): string {
  return indexTemplate({
    apiSpec: boundedContexts
  });
}

/**
 * Generates code to export all APIs in a API Family
 * @param apiNames Names of all the APIs in the family
 * @returns code to export all APIs in a API Family
 */
function createApiFamily(apiNames: string[]): string {
  return apiFamilyTemplate({
    apiNamesInFamily: apiNames
  });
}

/**
 * Renders API functions and its types into a typescript file
 * @param apiModel AMF Model of the API
 * @param renderDir Directory path at which the rendered API files are saved
 * @returns Name of the API
 */
function renderApi(
  apiModel: WebApiBaseUnitWithEncodesModel,
  renderDir: string
): string {
  const apiName: string = getApiName(apiModel);
  const apiPath: string = path.join(renderDir, apiName);
  fs.ensureDirSync(apiPath);
  //TODO: Modify createClient and createDto functions to take a single model object instead of array and get rid of apiModels array
  const apiModels: WebApiBaseUnitWithEncodesModel[] = [apiModel];
  fs.writeFileSync(
    path.join(apiPath, `${apiName}.ts`),
    createClient(apiModels, apiName)
  );
  fs.writeFileSync(
    path.join(apiPath, `${apiName}.types.ts`),
    createDto(apiModels)
  );
  return apiName;
}

/**
 * Renders API functions and its types into a typescript file for all the APIs in a family
 * @param apiFamily Name of the API family
 * @param apiFamilyConfig Config of the API family
 * @param apiRamlDir Directory path of API RAML files
 * @param renderDir Directory path to save the rendered API files
 * @returns Promise<void>
 */
function renderApiFamily(
  apiFamily: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiFamilyConfig: any,
  apiRamlDir: string,
  renderDir: string
): Promise<void> {
  const apiFamilyPath: string = path.join(renderDir, apiFamily);
  fs.ensureDirSync(apiFamilyPath);

  const familyPromises = processApiFamily(
    apiFamily,
    apiFamilyConfig,
    apiRamlDir
  );
  return Promise.all(familyPromises)
    .then(familyApis => {
      const apiNames: string[] = [];
      familyApis.forEach(api => {
        apiNames.push(
          renderApi(api as WebApiBaseUnitWithEncodesModel, apiFamilyPath)
        );
      });
      return apiNames;
    })
    .then(apiNames => {
      //export all apis in a family
      fs.writeFileSync(
        path.join(apiFamilyPath, `${apiFamily}.ts`),
        createApiFamily(apiNames)
      );
    });
}

/**
 * Renders typescript code for the APIs using the pre-defined templates
 * @param renderDir Directory path where the templates are rendered
 * @param apiRamlDir Directory path of API RAML files
 * @param apiConfigFile Configuration file of the API
 * @returns Promise<void>
 */
export function renderTemplates(
  renderDir: string,
  apiRamlDir: string,
  apiConfigFile: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apiFamilyRamlConfig = require(path.resolve(
    path.join(apiRamlDir, apiConfigFile)
  ));
  fs.ensureDirSync(renderDir);
  const apiFamilyNames = _.keysIn(apiFamilyRamlConfig);
  const allPromises: Promise<void>[] = [];
  apiFamilyNames.forEach((apiFamily: string) => {
    allPromises.push(
      renderApiFamily(apiFamily, apiFamilyRamlConfig, apiRamlDir, renderDir)
    );
  });
  //create index file that exports all the api families in the root
  return Promise.all(allPromises).then(() => {
    fs.writeFileSync(
      path.join(renderDir, "index.ts"),
      createIndex(apiFamilyNames)
    );
  });
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
