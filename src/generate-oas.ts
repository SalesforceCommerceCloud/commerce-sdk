/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import fs from "fs-extra";
import { generateFromOas } from "@commerce-apps/raml-toolkit";
import Handlebars from "handlebars";
import { apiDisplayName, readApiFolderIdentity } from "./lib/utils";

type ApiSpecDetail = {
  filepath: string;
  filename: string;
  name: string;
  apiName: string;
  directoryName: string;
};

const ZONES_SPEC_NAME = "Zones OAS";

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

const BASE_GENERATOR_FLAGS = "--reserved-words-mappings delete=delete";

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
 * @param name
 * @param version
 */
export function resolveApiName(name: string, version: string): string {
  if (name === "Shopper Baskets OAS" && version === "v2") {
    return "ShopperBasketsV2";
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
  if (name === "Cors OAS") {
    return "CORSPreferences";
  }
  if (name === "Auth Admin OAS") {
    return "SlasAdmin";
  }
  if (name === "Auth OAS") {
    return "ShopperLogin";
  }
  if (name === ZONES_SPEC_NAME) {
    return "CDNZones";
  }
  return name.replace(/\s+/g, "").replace("OAS", "");
}

function resolveDirectoryName(name: string, version?: string): string {
  let currentName = name;
  if (name === "auth") {
    currentName = "shopperLogin";
  }
  if (name === "auth-admin") {
    currentName = "slasAdmin";
  }
  if (name === "zones") {
    currentName = "cdnApiProcessApis";
  }
  if (name === "cors") {
    currentName = "corsPreferences";
  }
  return kebabToCamelCase(appendVersionIfV2(currentName, version || ""));
}

/**
 * Helper that reads api details from the spec file in an `apis/` folder
 * @param directory
 */
export function getAPIDetailsFromSpec(directory: string): ApiSpecDetail {
  const identity = readApiFolderIdentity(directory);
  if (!identity) {
    throw new Error(`No spec file found in ${directory}`);
  }
  const displayName = apiDisplayName(identity.assetId);
  return {
    filepath: path.join(directory, identity.specFile),
    filename: identity.specFile,
    directoryName: resolveDirectoryName(
      identity.assetId.replace("-oas", ""),
      identity.apiVersion
    ),
    name: identity.apiVersion === "v2" ? `${displayName} V2` : displayName,
    apiName: resolveApiName(displayName, identity.apiVersion),
  };
}

/**
 * The Zones spec ships some operations under a `Turnstile` tag; openapi-generator
 * would otherwise emit a separate TurnstileApi.ts whose class collides with
 * DefaultApi.ts on the spec-level `x-sdk-classname: CDNZones`. Collapsing every
 * operation onto the `default` tag keeps them on one generated class and
 * preserves the DefaultApi.ts filename shared with every other spec.
 */
export function resolveGeneratorFlags(apiSpecDetail: ApiSpecDetail): string {
  if (apiSpecDetail.apiName === "CDNZones") {
    return `${BASE_GENERATOR_FLAGS} --openapi-normalizer SET_TAGS_FOR_ALL_OPERATIONS=default`;
  }
  return BASE_GENERATOR_FLAGS;
}

/**
 * Invokes openapi-generator via raml-toolkit to generate SDKs
 * @param apiSpecDetail
 */
export function generateSDKs(apiSpecDetail: ApiSpecDetail): void {
  const { filepath, name, directoryName } = apiSpecDetail;
  if (fs.statSync(filepath).isFile()) {
    try {
      console.log(`Generating SDK for ${name}`);
      const outputDir = `${TARGET_DIRECTORY}/${directoryName}`;
      generateFromOas.generateFromOas({
        inputSpec: filepath,
        outputDir: `${outputDir}`,
        templateDir: `${TEMPLATE_DIRECTORY}`,
        flags: resolveGeneratorFlags(apiSpecDetail),
      });
    } catch (error) {
      console.error(`Error generating SDK for ${name}: ${error}`);
      throw error;
    }
  }
}

/**
 * Generates the top level index file
 * @param context
 * @param context.children
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

function getAllApiDirectories(basePath: string, relativePath = ""): string[] {
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
        if (readApiFolderIdentity(itemPath)) {
          directories.push(relativeItemPath);
        }
        directories.push(...getAllApiDirectories(basePath, relativeItemPath));
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
    const subDirectories: string[] = getAllApiDirectories(API_DIRECTORY);

    subDirectories.forEach((directory: string) => {
      try {
        const details = getAPIDetailsFromSpec(
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

if (require.main === module) {
  main();
}
