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
  groupByCategory,
  getNormalizedName
} from "./parser";

import {
  getBaseUri,
  isDefinedProperty,
  getDataType,
  isPrimitiveProperty,
  isArrayProperty,
  isObjectProperty,
  getArrayElementTypeProperty,
  getReturnPayloadType,
  getValue,
  getAdditionalProperties,
  isAdditionalPropertiesAllowed,
  isTypeDefinition,
  isCommonQueryParameter,
  isCommonPathParameter,
  getProperties,
  isRequiredProperty,
  isOptionalProperty
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
  fs.readFileSync(path.join(templateDirectory, "version.md.hbs"), "utf8")
);

const dtoPartial = Handlebars.compile(
  fs.readFileSync(path.join(templateDirectory, "dtoPartial.ts.hbs"), "utf8")
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
 * @param apiFamilies The list of api families we used to generate the code
 *
 * @returns The rendered code as a string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  //TODO: Modify createClient and createDto functions to take a single model object instead of array and get rid of apiModels array
  const apiModels: WebApiBaseUnitWithEncodesModel[] = [apiModel];
  fs.writeFileSync(
    path.join(apiPath, `${apiName}.types.ts`),
    createDto(apiModels)
  );
  //Resolve model for the end points Using the 'editing' pipeline will retain the declarations in the model
  const apiModelsForEndPoints: WebApiBaseUnitWithEncodesModel[] = [
    resolveApiModel(apiModel, "editing")
  ];
  fs.writeFileSync(
    path.join(apiPath, `${apiName}.ts`),
    createClient(apiModelsForEndPoints, apiName)
  );
  return apiName;
}

/**
 * @description
 * @export
 * @param {RestApi[]} apis
 */
export function createVersionFile(
  apis: RestApi[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: { [key: string]: any }
): void {
  const apiFamilyGroups = groupByCategory(apis, config["apiFamily"]);
  fs.writeFileSync(
    path.join(__dirname, "..", "VERSION.md"),
    versionTemplate(apiFamilyGroups)
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
function renderApiFamily(
  apiFamily: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiFamilyConfig: any,
  apiRamlDir: string,
  renderDir: string
): Promise<string> {
  const apiFamilyFileName = getNormalizedName(apiFamily);
  const apiFamilyPath: string = path.join(renderDir, apiFamilyFileName);
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
        path.join(apiFamilyPath, `${apiFamilyFileName}.ts`),
        createApiFamily(apiNames)
      );
      return apiFamilyFileName;
    });
}

/**
 * Renders typescript code for the APIs using the pre-defined templates
 * @param config uild config used to build the SDK

 * @returns Promise<void>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderTemplates(config: any): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apiFamilyRamlConfig = require(path.resolve(
    path.join(config.inputDir, config.apiConfigFile)
  ));
  fs.ensureDirSync(config.renderDir);
  const apiFamilyNames = _.keysIn(apiFamilyRamlConfig);
  const allPromises: Promise<string>[] = [];
  apiFamilyNames.forEach((apiFamily: string) => {
    allPromises.push(
      renderApiFamily(
        apiFamily,
        apiFamilyRamlConfig,
        config.inputDir,
        config.renderDir
      )
    );
  });
  //create index file that exports all the api families in the root
  return Promise.all(allPromises).then(familyNames => {
    fs.writeFileSync(
      path.join(config.renderDir, "index.ts"),
      createIndex(familyNames)
    );

    fs.writeFileSync(
      path.join(config.renderDir, "helpers.ts"),
      createHelpers(config)
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

Handlebars.registerHelper("isCommonQueryParameter", isCommonQueryParameter);

Handlebars.registerHelper("isCommonPathParameter", isCommonPathParameter);

Handlebars.registerHelper("isDefinedProperty", isDefinedProperty);

Handlebars.registerHelper("getDataType", getDataType);

Handlebars.registerHelper("isPrimitive", isPrimitiveProperty);

Handlebars.registerHelper("isArrayProperty", isArrayProperty);

Handlebars.registerHelper("isObjectProperty", isObjectProperty);

Handlebars.registerHelper("isTypeDefinition", isTypeDefinition);

Handlebars.registerHelper("getArrayElementType", getArrayElementTypeProperty);

Handlebars.registerHelper("getReturnPayloadType", getReturnPayloadType);

Handlebars.registerHelper("getValue", getValue);

Handlebars.registerHelper("getAdditionalProperties", getAdditionalProperties);

Handlebars.registerHelper(
  "isAdditionalPropertiesAllowed",
  isAdditionalPropertiesAllowed
);

Handlebars.registerPartial("dtoPartial", dtoPartial);

Handlebars.registerPartial("operationsPartial", operationsPartialTemplate);

Handlebars.registerHelper("getProperties", getProperties);

Handlebars.registerHelper("isRequiredProperty", isRequiredProperty);

Handlebars.registerHelper("isOptionalProperty", isOptionalProperty);
