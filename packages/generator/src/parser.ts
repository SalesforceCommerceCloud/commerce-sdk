/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  WebApiBaseUnit,
  WebApiBaseUnitWithDeclaresModel,
  WebApiBaseUnitWithEncodesModel
} from "webapi-parser";

import { model, Raml10Resolver } from "amf-client-js";
import amf from "amf-client-js";
import path from "path";
import _ from "lodash";
import { RestApi } from "@commerce-apps/raml-toolkit";

/**
 * Parses a RAML file to an AMF model
 *
 * @param ramlFile - Path to the RAML file to parse
 *
 * @returns The resulting AMF model
 */
export function processRamlFile(ramlFile: string): Promise<WebApiBaseUnit> {
  amf.plugins.document.WebApi.register();
  amf.plugins.features.AMFValidation.register();
  amf.plugins.document.Vocabularies.register();

  return amf.Core.init().then(() => {
    const parser = amf.Core.parser("RAML 1.0", "application/yaml");

    return parser.parseFileAsync(`file://${ramlFile}`).then(ramlModel => {
      return ramlModel as WebApiBaseUnit;
    });
  });
}

function getDataTypesFromDeclare(
  types: model.domain.DomainElement[],
  existingDataTypes: Set<string>
): model.domain.CustomDomainProperty[] {
  const ret: model.domain.CustomDomainProperty[] = [];
  types.forEach((dataType: model.domain.CustomDomainProperty) => {
    if (
      !existingDataTypes.has(dataType.name.value()) &&
      dataType.name.value() !== "trait"
    ) {
      existingDataTypes.add(dataType.name.value());
      ret.push(dataType);
    }
  });
  return ret;
}

/**
 * Get all the referenced data types
 *
 * @param apiReferences - Array of references
 * @param dataTypes - Array of data types
 * @param existingDataTypes - Set of names of data types, used to de-duplicate the data types
 */
export function getReferenceDataTypes(
  apiReferences: model.document.BaseUnit[],
  dataTypes: model.domain.CustomDomainProperty[],
  existingDataTypes: Set<string>
): void {
  if (apiReferences == null || apiReferences.length == 0) {
    return;
  }
  apiReferences.forEach((reference: WebApiBaseUnitWithDeclaresModel) => {
    if (reference.declares) {
      dataTypes.push(
        ...getDataTypesFromDeclare(reference.declares, existingDataTypes)
      );
    }
    getReferenceDataTypes(reference.references(), dataTypes, existingDataTypes);
  });
}

/**
 * Extract all of the delcared data types from an AMF model.
 *
 * @param api - The model to extract data types from
 *
 * @returns data types from model
 */
export function getAllDataTypes(
  api: WebApiBaseUnitWithDeclaresModel
): model.domain.CustomDomainProperty[] {
  let ret: model.domain.CustomDomainProperty[] = [];
  const dataTypes: Set<string> = new Set();
  const temp: model.domain.CustomDomainProperty[] = getDataTypesFromDeclare(
    api.declares,
    dataTypes
  );
  if (temp != null) {
    ret = temp;
  }
  getReferenceDataTypes(api.references(), ret, dataTypes);
  return ret;
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
): Promise<WebApiBaseUnit>[] {
  const promises = [];
  const ramlFileFromFamily = apiFamilyConfig[apiFamily];
  _.map(ramlFileFromFamily, (apiMeta: RestApi) => {
    if (!apiMeta.id) {
      throw Error(`Some information about '${apiMeta.name}' is missing in 'apis/api-config.json'. 
      Please ensure that '${apiMeta.name}' RAML and its dependencies are present in 'apis/', and all the required information is present in 'apis/api-config.json'.`);
    }
    promises.push(
      processRamlFile(
        path.join(inputDir, apiMeta.assetId, apiMeta.fatRaml.mainFile)
      )
    );
  });

  return promises;
}

/**
 * Resolves the AMF model using the given resolution pipeline
 *
 * @param apiModel - AMF model of the API
 * @param resolutionPipeline - resolution pipeline.
 *
 * @returns AMF model after resolving with the given pipeline
 */
export function resolveApiModel(
  apiModel: WebApiBaseUnitWithEncodesModel,
  resolutionPipeline: "default" | "editing" | "compatibility"
): WebApiBaseUnitWithEncodesModel {
  /**
   * TODO: core.resolution.pipelines.ResolutionPipeline has all the pipelines defined but is throwing an error when used - "Cannot read property 'pipelines' of undefined".
   *  When this is fixed we should change the type of input param "resolutionPipeline"
   */
  if (apiModel == null) {
    throw new Error("Invalid API model provided to resolve");
  }
  if (resolutionPipeline == null) {
    throw new Error("Invalid resolution pipeline provided to resolve");
  }
  const resolver = new Raml10Resolver();
  return resolver.resolve(
    apiModel,
    resolutionPipeline
  ) as WebApiBaseUnitWithEncodesModel;
}

/**
 * Get normalized name for the file/directory that is created while rendering the templates
 * @param name - File or directory name to normalize
 * @returns a normalized name
 */
export function getNormalizedName(name: string): string {
  if (!name) {
    throw new Error("Invalid name provided to normalize");
  }
  return _.camelCase(name);
}

/**
 * Returns API name from the AMF model in Pascal Case ("Shopper Customers" is returned as "ShopperCustomers")
 *
 * @param apiModel - AMF Model of the API
 * @returns Name of the API
 */
export function getApiName(apiModel: WebApiBaseUnitWithEncodesModel): string {
  const apiName: string = (apiModel.encodes as model.domain.WebApi).name.value();
  return getNormalizedName(apiName);
}
