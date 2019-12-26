/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { WebApiBaseUnit, WebApiBaseUnitWithDeclaresModel } from "webapi-parser";

// import amf from "webapi-parser";

import { model } from "amf-client-js";
import amf from "amf-client-js";

export function processRamlFile(ramlFile: string): Promise<WebApiBaseUnit> {
  amf.plugins.document.WebApi.register();
  amf.plugins.features.AMFValidation.register();
  amf.plugins.document.Vocabularies.register();

  return amf.Core.init().then(() => {
    const parser = amf.Core.parser("RAML 1.0", "application/yaml");

    return parser.parseFileAsync(`file://${ramlFile}`).then(function(model) {
      return model as WebApiBaseUnit;
    });
  });
}

function getDataTypesFromDeclare(
  types: model.domain.DomainElement[],
  existingDataTypes: Set<string>
): model.domain.CustomDomainProperty[] {
  const ret: model.domain.CustomDomainProperty[] = [];
  types.forEach((dataType: model.domain.CustomDomainProperty) => {
    if (!existingDataTypes.has(dataType.name.value())) {
      existingDataTypes.add(dataType.name.value());
      ret.push(dataType);
    } else {
      console.warn("Duplicate datatype: " + dataType.name.value());
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
