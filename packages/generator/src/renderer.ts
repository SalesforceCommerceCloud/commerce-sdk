/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";
import {
  getAllDataTypes,
  processApiFamily,
  getApiName,
  resolveApiModel,
  getNormalizedName
} from "./parser";

import {
  getBaseUri,
  getPropertyDataType,
  getParameterDataType,
  getRequestPayloadType,
  getReturnPayloadType,
  getValue,
  isAdditionalPropertiesAllowed,
  isTypeDefinition,
  isCommonQueryParameter,
  isCommonPathParameter,
  getProperties,
  isRequiredProperty,
  isOptionalProperty,
  getObjectIdByAssetId
} from "./templateHelpers";
import {
  WebApiBaseUnit,
  WebApiBaseUnitWithDeclaresModel,
  WebApiBaseUnitWithEncodesModel
} from "webapi-parser";
import _ from "lodash";
import { RestApi } from "@commerce-apps/exchange-connector";

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

const helpersTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "helpers.ts.hbs"), "utf8")
);

/**
 * Handlebar template to export all APIs in a family
 */
const apiFamilyTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "apiFamily.ts.hbs"), "utf8")
);

export const renderOperationListTemplate = Handlebars.compile(
  fs.readFileSync(
    path.join(templateDirectory, "operationList.yaml.hbs"),
    "utf8"
  )
);

const dtoTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dto.ts.hbs"), "utf8")
);

const versionTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "apiclients.md.hbs"), "utf8")
);

const dtoPartial = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dtoPartial.ts.hbs"), "utf8")
);

function createClient(webApiModel: WebApiBaseUnit, apiName: string): string {
  return clientInstanceTemplate(
    {
      dataTypes: getAllDataTypes(
        webApiModel as WebApiBaseUnitWithDeclaresModel
      ),
      apiModel: webApiModel,
      apiSpec: apiName
    },
    {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  );
}

function createDto(webApiModel: WebApiBaseUnit): string {
  const types = getAllDataTypes(webApiModel as WebApiBaseUnitWithDeclaresModel);
  return dtoTemplate(types, {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  });
}

/**
 * Generates code to export all API families to index.ts
 * @param apiFamilies The list of api families we used to generate the code
 *
 * @returns The rendered code as a string
 */
function createIndex(apiFamilies: string[]): string {
  return indexTemplate({
    apiSpec: apiFamilies
  });
}

/**
 * Generates helper methods for the SDK (Syntactical sugar)
 *
 * @returns The rendered code as a string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createHelpers(config: any): string {
  return helpersTemplate({
    shopperAuthClient: config.shopperAuthClient,
    shopperAuthApi: config.shopperAuthApi
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

  fs.writeFileSync(
    path.join(apiPath, `${apiName}.types.ts`),
    createDto(apiModel)
  );
  //Resolve model for the end points Using the 'editing' pipeline will retain the declarations in the model
  const apiModelForEndPoints: WebApiBaseUnitWithEncodesModel = resolveApiModel(
    apiModel,
    "editing"
  );
  fs.writeFileSync(
    path.join(apiPath, `${apiName}.ts`),
    createClient(apiModelForEndPoints, apiName)
  );
  return apiName;
}

/**
 * Sort API families and their APIs by name
 * @param apis object with api family name as key and array of apis as an array
 * @returns Sorted Map<string, RestApi[]> of api family name to its apis that are sorted
 */
export function sortApis(apis: {
  [key: string]: RestApi[];
}): Map<string, RestApi[]> {
  //build a sorted Map for api families and its apis
  const sortedApis = new Map<string, RestApi[]>();
  const apiFamilyNames = _.keysIn(apis).sort();
  apiFamilyNames.forEach(apiFamily => {
    const familyApis = apis[apiFamily];
    if (familyApis != null) {
      sortedApis.set(
        apiFamily,
        familyApis.sort((a, b) => (a.name > b.name ? 1 : -1))
      );
    }
  });
  return sortedApis;
}

/**
 * Create an MD file with all the APIs
 * @param {RestApi[]} apis
 * @param dir Directory path to save the rendered file
 */
export function createVersionFile(
  apis: { [key: string]: RestApi[] },
  dir: string
): void {
  fs.writeFileSync(
    // Write to the directory with the API definitions
    path.join(dir, "APICLIENTS.md"),
    versionTemplate({ apis: sortApis(apis) })
  );
}

/**
 * Renders API functions and its types into a typescript file for all the APIs in a family
 * @param apiFamily Name of the API family
 * @param apiFamilyConfig Config of the API family
 * @param apiRamlDir Directory path of API RAML files
 * @param renderDir Directory path to save the rendered API files
 * @returns Promise with the api family name
 */
async function renderApiFamily(
  apiFamily: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiFamilyConfig: any,
  apiRamlDir: string,
  renderDir: string
): Promise<string> {
  const apiFamilyFileName = getNormalizedName(apiFamily);
  const apiFamilyPath: string = path.join(renderDir, apiFamilyFileName);
  fs.ensureDirSync(apiFamilyPath);

  const familyApis = await Promise.all(
    processApiFamily(apiFamily, apiFamilyConfig, apiRamlDir)
  );
  const apiNames = familyApis.map(api =>
    renderApi(api as WebApiBaseUnitWithEncodesModel, apiFamilyPath)
  );
  //export all apis in a family
  fs.writeFileSync(
    path.join(apiFamilyPath, `${apiFamilyFileName}.ts`),
    createApiFamily(apiNames)
  );
  return apiFamilyFileName;
}

/**
 * Renders typescript code for the APIs using the pre-defined templates
 * @param config Build config used to build the SDK

 * @returns Promise<void>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderTemplates(config: any): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apiFamilyRamlConfig = require(path.resolve(
    path.join(config.inputDir, config.apiConfigFile)
  ));
  fs.ensureDirSync(config.renderDir);
  const apiFamilyNames = _.keysIn(apiFamilyRamlConfig);
  const familyNames = await Promise.all(
    apiFamilyNames.map((apiFamily: string) =>
      renderApiFamily(
        apiFamily,
        apiFamilyRamlConfig,
        config.inputDir,
        config.renderDir
      )
    )
  );

  //create index file that exports all the api families in the root
  fs.writeFileSync(
    path.join(config.renderDir, "index.ts"),
    createIndex(familyNames)
  );

  fs.writeFileSync(
    path.join(config.renderDir, "helpers.ts"),
    createHelpers(config)
  );

  createVersionFile(apiFamilyRamlConfig, path.join(config.renderDir, ".."));
}

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

Handlebars.registerHelper("isCommonQueryParameter", isCommonQueryParameter);

Handlebars.registerHelper("isCommonPathParameter", isCommonPathParameter);

Handlebars.registerHelper("getPropertyDataType", getPropertyDataType);

Handlebars.registerHelper("getParameterDataType", getParameterDataType);

Handlebars.registerHelper("getRequestPayloadType", getRequestPayloadType);

Handlebars.registerHelper("isTypeDefinition", isTypeDefinition);

Handlebars.registerHelper("getReturnPayloadType", getReturnPayloadType);

Handlebars.registerHelper("getValue", getValue);

Handlebars.registerHelper(
  "isAdditionalPropertiesAllowed",
  isAdditionalPropertiesAllowed
);

Handlebars.registerPartial("dtoPartial", dtoPartial);

Handlebars.registerPartial("operationsPartial", operationsPartialTemplate);

Handlebars.registerHelper("getProperties", getProperties);

Handlebars.registerHelper("isRequiredProperty", isRequiredProperty);

Handlebars.registerHelper("isOptionalProperty", isOptionalProperty);

Handlebars.registerHelper("getObjectIdByAssetId", getObjectIdByAssetId);

Handlebars.registerHelper("eachInMap", (map, block) => {
  let output = "";
  for (const [key, value] of map) {
    output += block.fn({ key, value });
  }
  return output;
});
