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
  parseRamlFile,
  getApiName,
  resolveApiModel,
  getNormalizedName
} from "@commerce-apps/raml-toolkit";

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
  getPascalCaseName,
  formatForTsDoc
} from "./templateHelpers";

import _ from "lodash";
import { RestApi } from "@commerce-apps/raml-toolkit";
import { model } from "@commerce-apps/raml-toolkit";
import { generatorLogger } from "./logger";

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

const operationListTemplate = Handlebars.compile(
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
 *
 * @param apis - Array of API info used to generate API clients file.
 */
export function sortApis(apis: ApiClientsInfoT[]): void {
  const compare = (a: string, b: string): number => (a > b ? 1 : -1);
  // Sort API families
  apis.sort((a, b) => compare(a[0].family, b[0].family));
  // Sort APIs within each family
  apis.forEach(details =>
    details.sort((a, b) => compare(a.config.name, b.config.name))
  );
}

/**
 * Creates the code for a client from an AMF model.
 *
 * @param webApiModel - The AMF model to create the client from
 * @param apiName - The name of the API
 *
 * @returns the code for the client as a string
 */
function createClient(
  webApiModel: model.document.BaseUnit,
  apiName: string
): string {
  return clientInstanceTemplate(
    {
      dataTypes: getAllDataTypes(
        webApiModel as model.document.BaseUnitWithDeclaresModel
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

/**
 * Create the DTO definitions from an AMF model.
 *
 * @param webApiModel - The AMF model to create DTO definitions from
 *
 * @returns the code for the DTO definitions as a string
 */
function createDto(webApiModel: model.document.BaseUnit): string {
  const types = getAllDataTypes(
    webApiModel as model.document.BaseUnitWithDeclaresModel
  );
  return dtoTemplate(types, {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  });
}

/**
 * Generates code to export all API families to index.ts
 *
 * @param familyNames - The list of api families we used to generate the code
 *
 * @returns The rendered code as a string
 */
function createIndex(familyNames: string[]): string {
  return indexTemplate({
    apiSpec: familyNames
  });
}

/**
 * Generates helper methods for the SDK (Syntactical sugar)
 *
 * @param buildConfig - Config used to build the SDK
 * @returns The rendered code as a string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createHelpers(buildConfig: any): string {
  return helpersTemplate({
    shopperAuthClient: buildConfig.shopperAuthClient,
    shopperAuthApi: buildConfig.shopperAuthApi
  });
}

/**
 * TODO:This is currently unused by will be put back into play by W-7557976
 *
 * Render the API Clients markdown file using the Handlebars template
 *
 * @param apiModelMap - Collection of API names and the AMF models associated with each API
 * @param apiConfig - The API family config
 *
 * @returns The rendered template
 */
/*
export function createApiClients(
  apiModelMap: Map<string, WebApiBaseUnit[]>,
  apiConfig: { [familyName: string]: RestApi[] }
): string {
  const apis = Array.from(apiModelMap).map(
    ([familyName, apiModels]): ApiClientsInfoT => {
      // Merge model and config into array of objects
      return apiModels.map((apiModel: WebApiBaseUnitWithEncodesModel, idx) => {
        return {
          family: familyName, // Included for ease of access within template
          model: apiModel.encodes as model.domain.WebApi,
          config: apiConfig[familyName][idx]
        };
      });
    }
  );
  sortApis(apis);
  return apiClientsTemplate({ apis });
}
*/

/**
 * Generates code to export all APIs in a API Family
 *
 * @param apiNames - Names of all the APIs in the family
 * @returns code to export all APIs in a API Family
 */
function createApiFamily(apiNames: string[]): string {
  return apiFamilyTemplate({
    apiNamesInFamily: apiNames
  });
}

/**
 * Renders API functions and its types into a typescript file
 *
 * @param apiModel - AMF Model of the API
 * @param renderDir - Directory path at which the rendered API files are saved
 * @returns Name of the API
 */
function renderApi(
  apiModel: model.document.BaseUnitWithEncodesModel,
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
  const apiModelForEndPoints: model.document.BaseUnitWithEncodesModel = resolveApiModel(
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
 *
 * @param familyName - Name of the API family
 * @param models - Array of AMF models
 * @param renderDir - Directory path to save the rendered API files
 * @returns List of API names in the API family
 */
function renderApiFamily(
  familyName: string,
  models: model.document.BaseUnit[],
  renderDir: string
): string[] {
  const fileName = getNormalizedName(familyName);
  const filePath: string = path.join(renderDir, fileName);
  fs.ensureDirSync(filePath);
  const apiNames = models.map(api =>
    renderApi(api as model.document.BaseUnitWithEncodesModel, filePath)
  );
  // export all APIs in the family
  fs.writeFileSync(
    path.join(filePath, `${fileName}.ts`),
    createApiFamily(apiNames)
  );
  return apiNames;
}

/**
 * Read all the RAML files for an API family and process into AML models.
 *
 * @param apiFamily - The name of the API family
 * @param apiFamilyConfig - The API family config
 * @param inputDir - The path to read the RAML files from
 *
 * @returns a list of promises that will resolve to the AMF models
 */
export function processApiFamily(
  apiFamily: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiFamilyConfig: any,
  inputDir: string
): Promise<model.document.BaseUnit[]> {
  const promises = [];
  const ramlFileFromFamily = apiFamilyConfig[apiFamily];
  _.map(ramlFileFromFamily, (apiMeta: RestApi) => {
    if (!apiMeta.id) {
      throw Error(`Some information about '${apiMeta.name}' is missing in 'apis/api-config.json'. 
      Please ensure that '${apiMeta.name}' RAML and its dependencies are present in 'apis/', and all the required information is present in 'apis/api-config.json'.`);
    }
    promises.push(
      parseRamlFile(
        path.join(inputDir, apiMeta.assetId, apiMeta.fatRaml.mainFile)
      )
    );
  });

  return Promise.all(promises);
}

/**
 * Renders typescript code for the APIs using the pre-defined templates
 *
 * @param buildConfig - Config used to build the SDK
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderTemplates(buildConfig: any): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apiConfig = require(path.resolve(
    path.join(buildConfig.inputDir, buildConfig.apiConfigFile)
  ));
  fs.ensureDirSync(buildConfig.renderDir);

  const apiFamilyNames = _.keysIn(apiConfig);
  const apiModelEntries = await Promise.all(
    apiFamilyNames.map(
      async (familyName): Promise<[string, model.document.BaseUnit[]]> => {
        const apiModels = await processApiFamily(
          familyName,
          apiConfig,
          buildConfig.inputDir
        );
        renderApiFamily(familyName, apiModels, buildConfig.renderDir);
        return [familyName, apiModels];
      }
    )
  );
  const apiModelMap = new Map(apiModelEntries);

  // Create files with static filenames

  // Create index file that exports all the API families in the root
  fs.writeFileSync(
    path.join(buildConfig.renderDir, "index.ts"),
    createIndex([...apiModelMap.keys()].map(name => _.camelCase(name)))
  );

  // Create file that exports helper functions
  fs.writeFileSync(
    path.join(buildConfig.renderDir, "helpers.ts"),
    createHelpers(buildConfig)
  );

  // Create file documenting available APIs
  // TODO: Remove generation of APICLIENTS.md from build
  // fs.writeFileSync(
  //   path.join(config.renderDir, "..", "APICLIENTS.md"),
  //   createApiClients(apiFamilyMap, apiFamilyRamlConfig)
  // );
  generatorLogger.info(
    "Successfully rendered code from the APIs: ",
    buildConfig.inputDir
  );
}

/**
 * Build the list of operations from a list of AMF models.
 *
 * @param allApis - key/value of APIs
 *
 * @returns list of operations as string
 */
export function renderOperationList(allApis: {
  [key: string]: model.document.BaseUnitWithEncodesModel[];
}): string {
  return operationListTemplate(allApis, {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  });
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

Handlebars.registerHelper("formatForTsDoc", formatForTsDoc);
