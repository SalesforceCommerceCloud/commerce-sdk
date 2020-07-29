/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

///// ALL SHOULD BE ONE IMPORT!!!!
import { common, getBearer } from "@commerce-apps/raml-toolkit";
import {
  searchExchange,
  downloadRestApis,
} from "@commerce-apps/raml-toolkit/lib/download/exchangeDownloader";
import {
  registerPartial,
  HandlebarsWithAmfHelpers as Handlebars,
} from "@commerce-apps/raml-toolkit/lib/generate/index";

import path from "path";

const templateDirectory = "templates";

//////// HELPER REGISTRATION ////////
import * as helpers from "./src/templateHelpers";
import { ApiTree } from "@commerce-apps/raml-toolkit/lib/common";
import { ApiMetadata } from "@commerce-apps/raml-toolkit/lib/common";
import { Api } from "@commerce-apps/raml-toolkit/lib/common";

function registerHelpers(): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("handlebars-helpers")({ handlebars: Handlebars });

  for (const helper of Object.keys(helpers)) {
    Handlebars.registerHelper(helper, helpers[helper]);
  }
}

/////// PARTIAL REGISTRATION //////
function registerPartials(): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  registerPartial(
    "dtoPartial",
    path.join(templateDirectory, "dtoPartial.ts.hbs")
  );
  registerPartial(
    "operationsPartial",
    path.join(templateDirectory, "operations.ts.hbs")
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupTemplates(apis: ApiTree): any {
  apis.addTemplate("templates/index.ts.hbs", "newPipeline/index.ts");
  apis.addTemplate("templates/helpers.ts.hbs", "newPipeline/helpers.ts");

  apis.children.forEach((child: ApiMetadata) => {
    child.addTemplate(
      "templates/apiFamily.ts.hbs",
      `newPipeline/${child.name.lowerCamelCase}/index.ts`
    );
    child.children.forEach((api: Api) => {
      api.addTemplate(
        "templates/ClientInstance.ts.hbs",
        path.join(
          "newPipeline",
          child.name.lowerCamelCase,
          api.name.lowerCamelCase,
          `${api.name.lowerCamelCase}.ts`
        )
      );
    });
  });
  return apis;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createSdk() {
  let apis = await common.createApiTree("./newApis");
  apis = setupTemplates(apis);
  return apis.renderAll();
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function updateApis(apiFamily) {
  const token = await getBearer(
    process.env.ANYPOINT_USERNAME,
    process.env.ANYPOINT_PASSWORD
  );
  const apis = await searchExchange(
    token,
    `category:"CC API Family" = "${apiFamily}"`
  );
  await downloadRestApis(apis, `newApis/${apiFamily}`);
}

// updateApis("pricing");
// updateApis("customer");
// updateApis("checkout");
// updateApis("search");
// updateApis("product");
// updateApis("cdn");

registerHelpers();
registerPartials();
createSdk();
