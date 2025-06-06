/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import fs from "fs-extra";
import { generateFromOas, download } from "@commerce-apps/raml-toolkit";
import Handlebars from "handlebars";

type ApiSpecDetail = {
  filepath: string;
  filename: string;
  name: string;
  apiName: string;
  directoryName: string;
};

const API_DIRECTORY = path.resolve(`${__dirname}/../apis`);
const STATIC_DIRECTORY = path.join(__dirname, "./static");
const TARGET_DIRECTORY = path.resolve(`${__dirname}/../renderedTemplates`);
const TEMPLATE_DIRECTORY = path.resolve(`${__dirname}/../templatesOas`);
const INDEX_TEMPLATE_LOCATION = path.resolve(
  `${__dirname}/../templates/index.ts.hbs`
);

function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, letter: string) =>
    letter.toUpperCase()
  );
}

/**
 * Helper function. Also contains explicit workaround for some API names.
 */
export function resolveApiName(name: string): string {
  if (name === "Shopper orders OAS") {
    return "ShopperOrders";
  }
  if (name === "CDN API - Process APIs OAS") {
    return "CDNZones";
  }
  if (name === "SLAS Admin-UAP OAS") {
    return "SlasAdmin";
  }
  return name.replace(/\s+/g, "").replace("OAS", "");
}

/**
 * Helper that reads api details from exchange.json
 */
export function getAPIDetailsFromExchange(directory: string): ApiSpecDetail {
  const exchangePath = path.join(directory, "exchange.json");
  if (fs.existsSync(exchangePath)) {
    const exchangeConfig = fs.readJSONSync(
      exchangePath
    ) as download.ExchangeConfig;

    // Special handling for shopper-baskets-v2
    if (exchangeConfig.assetId === "shopper-baskets-oas" && exchangeConfig.apiVersion === "v2") {
      return {
        filepath: path.join(directory, exchangeConfig.main),
        filename: exchangeConfig.main,
        directoryName: "ShopperBasketsV2",
        name: "Shopper Baskets V2 OAS",
        apiName: "ShopperBasketsV2",
      };
    }

    return {
      filepath: path.join(directory, exchangeConfig.main),
      filename: exchangeConfig.main,
      directoryName: kebabToCamelCase(
        exchangeConfig.assetId.replace("-oas", ""),
      ),
      name: exchangeConfig.name,
      apiName: resolveApiName(exchangeConfig.name),
    };
  }
  throw new Error(`Exchange file does not exist for ${directory}`);
}

/**
 * Invokes openapi-generator via raml-toolkit to generate SDKs
 */
export function generateSDKs(apiSpecDetail: ApiSpecDetail): void {
  const { filepath, name, directoryName } = apiSpecDetail;
  const fileIsOASspec = filepath.includes("oas");
  if (fs.statSync(filepath).isFile() && fileIsOASspec) {
    try {
      console.log(`Generating SDK for ${name}`);
      const outputDir = `${TARGET_DIRECTORY}/${directoryName}`;
      generateFromOas.generateFromOas({
        inputSpec: `${filepath}`,
        outputDir: `${outputDir}`,
        templateDir: `${TEMPLATE_DIRECTORY}`,
        flags: `--reserved-words-mappings delete=delete`
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.error(`Error generating SDK for ${name}: ${error}`);
    }
  }
}

/**
 * Generates the top level index file
 */
export function generateIndex(context: {
  children: ApiSpecDetail[] | { name: string; apiName: string }[];
}): void {
  const indexTemplate = fs.readFileSync(INDEX_TEMPLATE_LOCATION, "utf8");
  const generatedIndex = Handlebars.compile(indexTemplate)(context);
  fs.writeFileSync(`${TARGET_DIRECTORY}/index.ts`, generatedIndex);
}

function getAllDirectories(basePath: string, relativePath = ""): string[] {
  const fullPath = path.join(basePath, relativePath);
  const directories: string[] = [];

  try {
    const items = fs.readdirSync(fullPath);

    for (const item of items) {
      const itemPath = path.join(fullPath, item);
      const relativeItemPath = relativePath
        ? path.join(relativePath, item)
        : item;

      if (fs.lstatSync(itemPath).isDirectory()) {
        directories.push(relativeItemPath);
        directories.push(...getAllDirectories(basePath, relativeItemPath));
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${fullPath}:`, error);
  }

  return directories;
}

/**
 * Copies the static files to the target directory
 */
export function copyStaticFiles(): void {
  const skipTestFiles = (src: string): boolean => !/\.test\.[a-z]+$/.test(src);
  fs.copySync(STATIC_DIRECTORY, TARGET_DIRECTORY, {filter: skipTestFiles});
}

/**
 * Main function
 */
export function main(): void {
  console.log("Starting OAS generation script");
  fs.readdir(API_DIRECTORY, (err: Error, directories: string[]) => {
    if (err) {
      console.error("Error reading api directory:", err);
      return;
    }

    const apiSpecDetails: ApiSpecDetail[] = [];
    const subDirectories: string[] = getAllDirectories(API_DIRECTORY);
    console.log("subDirectories: ", subDirectories);

    subDirectories.forEach((directory: string) => {
      try {
        const details = getAPIDetailsFromExchange(
          path.join(API_DIRECTORY, directory)
        );
        apiSpecDetails.push(details);
      } catch (error) {
        console.log(`Skipping directory ${directory}: ${error}`);
      }
    });

    apiSpecDetails.forEach((apiSpecDetail: ApiSpecDetail) => {
      generateSDKs(apiSpecDetail);
    });

    generateIndex({ children: apiSpecDetails });
    copyStaticFiles();

    console.log(
      `OAS generation script completed. Files outputted to ${TARGET_DIRECTORY}`
    );
  });
}

main();
