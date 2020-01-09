/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { WebApiBaseUnit, WebApiBaseUnitWithDeclaresModel } from "webapi-parser";

import { model, Raml10Resolver, core } from "amf-client-js";
import amf from "amf-client-js";

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
         * Using the 'editing' pipeline will retain those declarations in  the model.
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
