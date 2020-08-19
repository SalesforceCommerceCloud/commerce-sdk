/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { generate, download } from "@commerce-apps/raml-toolkit";
import path from "path";

const TEMPLATE_DIRECTORY = `${__dirname}/../../templates`;

//////// HELPER REGISTRATION ////////
const Handlebars = generate.HandlebarsWithAmfHelpers;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("handlebars-helpers")({ handlebars: Handlebars });

import * as helpers from "./templateHelpers";

/**
 * Register the custom helpers defined in our pipeline
 */
export function registerHelpers(): void {
  for (const helper of Object.keys(helpers)) {
    Handlebars.registerHelper(helper, helpers[helper]);
  }
}

/**
 * Register any customer partials we have in our pipeline
 */
export function registerPartials(): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  generate.registerPartial(
    "dtoPartial",
    path.join(TEMPLATE_DIRECTORY, "dtoPartial.ts.hbs")
  );
  generate.registerPartial(
    "operationsPartial",
    path.join(TEMPLATE_DIRECTORY, "operations.ts.hbs")
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addTemplates(
  apis: generate.ApiMetadata,
  outputBasePath: string
): generate.ApiMetadata {
  apis.addTemplate(
    path.join(TEMPLATE_DIRECTORY, "index.ts.hbs"),
    path.join(outputBasePath, "index.ts")
  );
  apis.addTemplate(
    path.join(TEMPLATE_DIRECTORY, "helpers.ts.hbs"),
    path.join(outputBasePath, "helpers.ts")
  );

  apis.children.forEach((child: generate.ApiMetadata) => {
    child.addTemplate(
      path.join(TEMPLATE_DIRECTORY, "apiFamily.ts.hbs"),
      path.join(
        outputBasePath,
        child.name.lowerCamelCase,
        `${child.name.lowerCamelCase}.ts`
      )
    );
    child.children.forEach(async (api: generate.ApiModel) => {
      api.addTemplate(
        path.join(TEMPLATE_DIRECTORY, "ClientInstance.ts.hbs"),
        path.join(
          outputBasePath,
          child.name.lowerCamelCase,
          api.name.lowerCamelCase,
          `${api.name.lowerCamelCase}.ts`
        )
      );
    });
  });
  return apis;
}

/**
 * Primary driver, loads the apis and templates associated with those apis.
 *
 * @param inputDir - Directory for input
 * @param outputDir - Directory for output
 *
 * @returns - The a promise to have the ApiMetaData tree ready to be rendered
 */
export async function setupApis(
  inputDir: string,
  outputDir: string
): Promise<generate.ApiMetadata> {
  let apis = generate.loadApiDirectory(inputDir);
  await apis.init();

  apis = addTemplates(apis, outputDir);
  return apis;
}

/**
 * Updates a set of APIs for an api family and saves it to a path.
 *
 * NOTE: Coverage passes without this function being covered.
 *  We should have some followup to figure out how to cover it.
 *  Ive spent hours trying to mock download
 *
 * @param apiFamily - Api family to download
 * @param deployment - What deployment to build for
 * @param rootPath - Root path to download to
 *
 * @returns a promise that we will complete
 */
export async function updateApis(
  apiFamily: string,
  deployment: RegExp,
  rootPath: string
): Promise<void> {
  try {
    const apis = await download.search(
      `category:"CC API Family" = "${apiFamily}"`,
      deployment
    );
    await download.downloadRestApis(apis, path.join(rootPath, apiFamily));
  } catch (e) {
    console.error(e);
  }
}
