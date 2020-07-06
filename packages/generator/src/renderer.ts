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
  getNormalizedName,
  RestApi,
  model
} from "@commerce-apps/raml-toolkit";
import _ from "lodash";
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
import { generatorLogger } from "./logger";

interface IApiConfig {
  [familyName: string]: RestApi[];
}
interface IBuildConfig {
  inputDir: string;
  renderDir: string;
  apiFamily: string;
  exchangeSearch: string;
  apiConfigFile: string;
  shopperAuthClient: string;
  shopperAuthApi: string;
  exchangeDeploymentRegex: RegExp;
}

/**
 * Api Document with metadata
 * TODO: This should be moved into raml-toolkit
 */
export type DocumentWithMetadataT = {
  document: model.document.Document;
  metadata: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
};

/**
 * The name of an API family and its associated AMF models.
 */
type ApiModelTupleT = [string, DocumentWithMetadataT[]];

const templateDirectory = `${__dirname}/../templates`;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("handlebars-helpers")({ handlebars: Handlebars }, [
  "string",
  "comparison"
]);

// HANDLEBARS TEMPLATES

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

const dtoTemplate = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dto.ts.hbs"), "utf8")
);

const dtoPartial = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dtoPartial.ts.hbs"), "utf8")
);

// HELPER FUNCTIONS

/**
 * Loads the API family config from the location specified in the build config.
 *
 * @param buildConfig - Config used to build the SDK
 * @returns The API family config
 */
export function loadApiConfig(
  buildConfig: Pick<IBuildConfig, "apiConfigFile" | "inputDir">
): IApiConfig {
  return require(path.resolve(buildConfig.inputDir, buildConfig.apiConfigFile));
}

/**
 * Read all the RAML files for an API family and process into AML models.
 *
 * @param apiFamily - Array of REST API data for an API family
 * @param inputDir - The path to read the RAML files from
 * @returns a list of promises that will resolve to the AMF models
 */
export async function processApiFamily(
  apiFamily: RestApi[],
  inputDir: string
): Promise<DocumentWithMetadataT[]> {
  const promises = apiFamily.map(async apiMeta => {
    if (!apiMeta.id) {
      throw new Error(`Some information about '${apiMeta.name}' is missing in 'apis/api-config.json'. 
      Please ensure that '${apiMeta.name}' RAML and its dependencies are present in 'apis/', and all the required information is present in 'apis/api-config.json'.`);
    }
    return {
      document: await parseRamlFile(
        path.join(inputDir, apiMeta.assetId, apiMeta.fatRaml.mainFile)
      ),
      metadata: apiMeta
    };
  });

  return Promise.all(promises);
}

/**
 * Processes the RAML files specified by the given config into AMF models,
 * and groups them by API family.
 *
 * @param apiConfig - The API family config
 * @param buildConfig - Config used to build the SDK
 * @returns An array of tuples for each API family containing the API family's
 * name and associated AMF models
 */
export async function getApiModelTuples(
  apiConfig: IApiConfig,
  buildConfig: Pick<IBuildConfig, "inputDir">
): Promise<ApiModelTupleT[]> {
  const promises = _.keysIn(apiConfig).map(
    async (familyName): Promise<ApiModelTupleT> => {
      return [
        familyName,
        await processApiFamily(apiConfig[familyName], buildConfig.inputDir)
      ];
    }
  );
  return Promise.all(promises);
}

// TEMPLATE FILLING FUNCTIONS

/**
 * Creates the code for a client from an AMF model.
 *
 * @param webApiModel - The AMF model to create the client from
 * @param apiName - The name of the API
 *
 * @returns The rendered code for the client as a string
 */
function createClient(
  webApiModel: model.document.BaseUnitWithDeclaresModel,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiMetadata: { [key: string]: any }
): string {
  return clientInstanceTemplate(
    {
      dataTypes: getAllDataTypes(webApiModel),
      apiModel: webApiModel,
      metadata: apiMetadata
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
 * @returns The rendered code for the DTO definitions as a string
 */
function createDto(
  webApiModel: model.document.BaseUnitWithDeclaresModel
): string {
  const types = getAllDataTypes(webApiModel);
  return dtoTemplate(types, {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  });
}

/**
 * Create the code to export all API families from an index file.
 *
 * @param apiModelTuples - List of API names and the AMF models associated with each API
 * @returns The rendered code as a string
 */
function createIndex(apiModelTuples: ApiModelTupleT[]): string {
  return indexTemplate({
    apiSpec: apiModelTuples.map(([familyName]) => _.camelCase(familyName))
  });
}

/**
 * Create the helper methods for the SDK (syntactical sugar).
 *
 * @param buildConfig - Config used to build the SDK
 * @returns The rendered code as a string
 */
function createHelpers(buildConfig: IBuildConfig): string {
  return helpersTemplate({
    shopperAuthClient: buildConfig.shopperAuthClient,
    shopperAuthApi: buildConfig.shopperAuthApi
  });
}

/**
 * Creates the code to export all APIs in a API Family.
 *
 * @param apiNames - Names of all the APIs in the family
 * @returns The rendered code as a string
 */
function createApiFamily(apiNames: string[]): string {
  return apiFamilyTemplate({
    apiNamesInFamily: apiNames
  });
}

// FILE CREATION FUNCTIONS

/**
 * Renders API functions and types into a TypeScript file for a single API.
 *
 * @param apiModel - AMF Model of the API
 * @param renderDir - Directory path at which the rendered API files are saved
 * @returns The name of the API
 */
function renderApi(apiModel: DocumentWithMetadataT, renderDir: string): string {
  apiModel.metadata.specName = getApiName(apiModel.document);
  apiModel.metadata.apiPath = path.join(renderDir, apiModel.metadata.specName);
  fs.ensureDirSync(apiModel.metadata.apiPath);

  fs.writeFileSync(
    path.join(
      apiModel.metadata.apiPath,
      `${apiModel.metadata.specName}.types.ts`
    ),
    createDto(apiModel.document)
  );
  // Resolve model for the end points using the 'editing' pipeline will retain the declarations in the model
  const apiModelForEndPoints = resolveApiModel(apiModel.document, "editing");
  fs.writeFileSync(
    path.join(apiModel.metadata.apiPath, `${apiModel.metadata.specName}.ts`),
    createClient(apiModelForEndPoints, apiModel.metadata)
  );
  return apiModel.metadata.specName;
}

/**
 * Renders API functions and types into a TypeScript file for all the APIs in a family.
 *
 * @param familyName - Name of the API family
 * @param models - Array of AMF models
 * @param renderDir - Directory path to save the rendered API files
 * @returns List of API names in the API family
 */
function renderApiFamily(
  familyName: string,
  models: DocumentWithMetadataT[],
  renderDir: string
): string[] {
  const fileName = getNormalizedName(familyName);
  const filePath: string = path.join(renderDir, fileName);
  fs.ensureDirSync(filePath);
  const apiNames = models.map(api => renderApi(api, filePath));
  // export all APIs in the family
  fs.writeFileSync(
    path.join(filePath, `${fileName}.ts`),
    createApiFamily(apiNames)
  );
  return apiNames;
}

/**
 * Renders the TypeScript code for the APIs using the pre-defined templates.
 *
 * @param buildConfig - Config used to build the SDK
 */
export async function renderTemplates(
  buildConfig: IBuildConfig
): Promise<void> {
  const apiConfig = loadApiConfig(buildConfig);
  fs.ensureDirSync(buildConfig.renderDir);

  const apiModelTuples = await getApiModelTuples(apiConfig, buildConfig);
  // Create dynamic files
  apiModelTuples.forEach(([familyName, apiModels]) => {
    renderApiFamily(familyName, apiModels, buildConfig.renderDir);
  });

  // Create index file that exports all the API families in the root
  fs.writeFileSync(
    path.join(buildConfig.renderDir, "index.ts"),
    createIndex(apiModelTuples)
  );

  // Create file that exports helper functions
  fs.writeFileSync(
    path.join(buildConfig.renderDir, "helpers.ts"),
    createHelpers(buildConfig)
  );

  generatorLogger.info(
    "Successfully rendered code from the APIs: ",
    buildConfig.inputDir
  );
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
