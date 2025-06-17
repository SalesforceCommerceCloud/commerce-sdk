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
const VERSION_TEMPLATE_LOCATION = path.resolve(
  `${__dirname}/../templates/version.ts.hbs`
);

function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, letter: string) =>
    letter.toUpperCase()
  );
}

function appendVersionIfV2(name: string, version: string): string {
  if (version === "V1" || version === "v1") {
    return name;
  }
  return name + version;
}

/**
 * Helper function. Also contains explicit workaround for some API names.
 */
export function resolveApiName(name: string, version: string): string {
  if (name === "Shopper Baskets OAS") {
    return version === "v2" ? "ShopperBasketsV2" : "ShopperBasketsV1";
  }
  if (name === "CDN API - Process APIs OAS") {
    return "CDNZones";
  }
  if (name === "SLAS Admin-UAP OAS") {
    return "SlasAdmin";
  }
  if (name === "Shopper Seo OAS") {
    return "ShopperSEO";
  }
  if (name === "Shopper Context OAS") {
    return "ShopperContexts";
  }
  if (name === "Catalogs OAS") {
    return "CatalogsV1";
  }
  if (name === "Cors Preferences OAS") {
    return "CORSPreferences";
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

    return {
      filepath: path.join(
        directory,
        exchangeConfig.main.replace('-public.yaml', '-internal.yaml')
      ),
      filename: exchangeConfig.main,
      directoryName: kebabToCamelCase(
        appendVersionIfV2(exchangeConfig.assetId.replace("-oas", ""), exchangeConfig.apiVersion)),
      name: exchangeConfig.apiVersion === "v2" ? exchangeConfig.name + " V2" : exchangeConfig.name,
      apiName: resolveApiName(exchangeConfig.name, exchangeConfig.apiVersion),
    };
  }
  throw new Error(`Exchange file does not exist for ${directory}`);
}

/**
 * Invokes openapi-generator via raml-toolkit to generate SDKs
 */
export function generateSDKs(apiSpecDetail: ApiSpecDetail): void {
  const { filepath, name, directoryName } = apiSpecDetail;
  if (fs.statSync(filepath).isFile()) {
    try {
      console.log(`Generating SDK for ${name}`);
      const outputDir = `${TARGET_DIRECTORY}/${directoryName}`;
      generateFromOas.generateFromOas({
        inputSpec: `${filepath}`,
        outputDir: `${outputDir}`,
        templateDir: `${TEMPLATE_DIRECTORY}`,
        flags: `--reserved-words-mappings delete=delete`,
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

/**
 * Generates the version file
 */
export function generateVersionFile(): void {
  const version = process.env.PACKAGE_VERSION || "unknown";
  const versionTemplate = fs.readFileSync(VERSION_TEMPLATE_LOCATION, "utf8");
  const generatedVersion = Handlebars.compile(versionTemplate)({
    metadata: { sdkVersion: version },
  });
  fs.writeFileSync(`${TARGET_DIRECTORY}/version.ts`, generatedVersion);
}

function getAllDirectoriesWithExchangeFiles(
  basePath: string,
  relativePath = ""
): string[] {
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
        if (fs.existsSync(path.join(itemPath, "exchange.json"))) {
          directories.push(relativeItemPath);
        }
        directories.push(
          ...getAllDirectoriesWithExchangeFiles(basePath, relativeItemPath)
        );
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
  fs.copySync(STATIC_DIRECTORY, TARGET_DIRECTORY, { filter: skipTestFiles });
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
    const subDirectories: string[] =
      getAllDirectoriesWithExchangeFiles(API_DIRECTORY);

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
    generateVersionFile();
    copyStaticFiles();

    console.log(
      `OAS generation script completed. Files outputted to ${TARGET_DIRECTORY}`
    );
  });
}

main();
