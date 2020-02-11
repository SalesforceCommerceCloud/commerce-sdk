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
import { RestApi } from "@commerce-apps/exchange-connector";

export function processRamlFile(ramlFile: string): Promise<WebApiBaseUnit> {
  amf.plugins.document.WebApi.register();
  amf.plugins.features.AMFValidation.register();
  amf.plugins.document.Vocabularies.register();

  const resolver = new Raml10Resolver();

  return amf.Core.init().then(() => {
    const parser = amf.Core.parser("RAML 1.0", "application/yaml");

    return parser.parseFileAsync(`file://${ramlFile}`).then(ramlModel => {
      ramlModel = resolver.resolve(
        ramlModel,

        /**
         *
         * In AMF There are a few pipelines for 'resolution'
         * The default one is unsurprisingly called 'default'
         *
         * By default it will resolve declarations to be inline which we do not want as we want
         * to be able to use those declarations as well for types.
         *
         * Using the 'editing' pipeline will retain those declarations in the model.
         *
         * There is a constant of 'core.resolution.pipelines.ResolutionPipeline.EDITING_PIPELINE' from amf but
         * for some reason I can't use it because it says 'resolution' is undefined
         *
         **/
        "editing"
      );

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

export function getAllDataTypes(
  apis: WebApiBaseUnitWithDeclaresModel[]
): model.domain.CustomDomainProperty[] {
  let ret: model.domain.CustomDomainProperty[] = [];
  const dataTypes: Set<string> = new Set();
  apis.forEach(element => {
    element
      .references()
      .forEach((reference: WebApiBaseUnitWithDeclaresModel) => {
        if (reference.declares) {
          ret = ret.concat(
            getDataTypesFromDeclare(reference.declares, dataTypes)
          );
        }
      });
    ret = ret.concat(getDataTypesFromDeclare(element.declares, dataTypes));
  });
  return ret;
}

export function processApiFamily(
  apiFamily: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiFamilyConfig: any,
  inputDir: string
): Promise<WebApiBaseUnit>[] {
  const promises = [];
  const ramlFileFromFamily = apiFamilyConfig[apiFamily];
  _.map(ramlFileFromFamily, (apiMeta: RestApi) => {
    promises.push(
      processRamlFile(
        path.join(inputDir, apiMeta.assetId, apiMeta.fatRaml.mainFile)
      )
    );
  });

  return promises;
}

/**
 * Get normalized name for the file/directory that is created while rendering the templates
 * @param name File or directory name to normalize
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
 * @param apiModel AMF Model of the API
 * @returns Name of the API
 */
export function getApiName(apiModel: WebApiBaseUnitWithEncodesModel): string {
  const apiName: string = (apiModel.encodes as model.domain.WebApi).name.value();
  return getNormalizedName(apiName);
}

/**
 * @description
 * @export
 * @param {RestApi[]} apis
 * @param {string} groupBy
 * @param {boolean} [allowUnclassified=true]
 * @returns {{ [key: string]: RestApi[] }}
 */
export function groupByCategory(
  apis: RestApi[],
  groupBy: string,
  allowUnclassified = true
): { [key: string]: RestApi[] } {
  return _.groupBy(apis, api => {
    // Categories are actually a list.
    // We are just going to use whatever the first one is for now
    if (api.categories && groupBy in api.categories) {
      return api.categories[groupBy][0];
    } else if (allowUnclassified) {
      return "unclassified";
    } else {
      throw new Error("Unclassified APIs are NOT allowed!");
    }
  });
}
