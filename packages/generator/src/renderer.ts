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
  getObjectIdByAssetId,
  getName,
  getCamelCaseName,
  getPascalCaseName
} from "./templateHelpers";
import {
  WebApiBaseUnit,
  WebApiBaseUnitWithDeclaresModel,
  WebApiBaseUnitWithEncodesModel
} from "webapi-parser";
import _ from "lodash";
import { RestApi } from "@commerce-apps/exchange-connector";
import { model } from "amf-client-js";

/**
 * Information used to generate APICLIENTS.md.
 */
export type ApiClientsInfoT = {
  model: model.domain.WebApi;
  family: string;
  config: RestApi;
}[];
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

const apiClientsTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "apiclients.md.hbs"), "utf8")
);

const dtoPartial = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dtoPartial.ts.hbs"), "utf8")
);

/**
 * Sort API families and their APIs by name.
 */
export function sortApis(apis: ApiClientsInfoT[]): void {
  const compare = (a: string, b: string): number =>
    a > b ? 1 : a < b ? -1 : 0;
  // Sort API families
  apis.sort((a, b) => compare(a[0].family, b[0].family));
  // Sort APIs within each family
  apis.forEach(details =>
    details.sort((a, b) => compare(a.config.name, b.config.name))
  );
}

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
 * Render the API Clients markdown file using the Handlebars template
 * @param {Map<string, WebApiBaseUnit[]>} apiFamilyMap
 * @param {Object.<string, RestApi[]} apiFamilyConfig
 * @returns {string} The rendered template
 */
export function createApiClients(
  apiFamilyMap: Map<string, WebApiBaseUnit[]>,
  apiFamilyConfig: { [key: string]: RestApi[] }
): string {
  const apis = Array.from(apiFamilyMap).map(
    ([family, apiModels]): ApiClientsInfoT => {
      // Merge model and config into array of objects
      return apiModels.map((apiModel: WebApiBaseUnitWithEncodesModel, idx) => {
        return {
          family, // Included for ease of access within template
          model: apiModel.encodes as model.domain.WebApi,
          config: apiFamilyConfig[family][idx]
        };
      });
    }
  );
  sortApis(apis);
  return apiClientsTemplate({ apis });
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
 * Renders API functions and its types into a typescript file for all the APIs in a family
 * @param apiFamily - Name of the API family
 * @param familyApis - Array of AMF models
 * @param renderDir - Directory path to save the rendered API files
 * @returns {string[]} List of API names in the API family
 */
function renderApiFamily(
  apiFamily: string,
  familyApis: WebApiBaseUnit[],
  renderDir: string
): string[] {
  const apiFamilyFileName = getNormalizedName(apiFamily);
  const apiFamilyPath: string = path.join(renderDir, apiFamilyFileName);
  fs.ensureDirSync(apiFamilyPath);
  const apiNames = familyApis.map(api =>
    renderApi(api as WebApiBaseUnitWithEncodesModel, apiFamilyPath)
  );
  // export all APIs in the family
  fs.writeFileSync(
    path.join(apiFamilyPath, `${apiFamilyFileName}.ts`),
    createApiFamily(apiNames)
  );
  return apiNames;
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
  const apiFamilyEntries = await Promise.all(
    apiFamilyNames.map(
      async (familyName): Promise<[string, WebApiBaseUnit[]]> => {
        const familyApis = await Promise.all(
          processApiFamily(familyName, apiFamilyRamlConfig, config.inputDir)
        );
        renderApiFamily(familyName, familyApis, config.renderDir);
        return [familyName, familyApis];
      }
    )
  );
  const apiFamilyMap = new Map(apiFamilyEntries);

  // Create files with static filenames

  // Create index file that exports all the API families in the root
  fs.writeFileSync(
    path.join(config.renderDir, "index.ts"),
    createIndex([...apiFamilyMap.keys()])
  );

  // Create file that exports helper functions
  fs.writeFileSync(
    path.join(config.renderDir, "helpers.ts"),
    createHelpers(config)
  );

  // Create file documenting available APIs
  fs.writeFileSync(
    path.join(config.renderDir, "..", "APICLIENTS.md"),
    createApiClients(apiFamilyMap, apiFamilyRamlConfig)
  );
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

Handlebars.registerHelper("getName", getName);

Handlebars.registerHelper("getCamelCaseName", getCamelCaseName);

Handlebars.registerHelper("getPascalCaseName", getPascalCaseName);
