/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from "path";
import fs from 'fs-extra';
import {generateFromOas} from '@commerce-apps/raml-toolkit';
import { registerHelpers, registerPartials, setupApis } from "./lib/utils";

type ExchangeConfig = {
  dependencies?: {
    version: string;
    assetId: string;
    groupId: string;
  }[];
  version: string;
  originalFormatVersion: string;
  apiVersion: string;
  descriptorVersion: string;
  classifier: string;
  main: string;
  assetId: string;
  groupId: string;
  organizationId: string;
  name: string;
  tags: string[];
};

type ApiSpecDetail = {
  filepath: string;
  filename: string;
  name: string;
  apiName: string;
  directoryName: string;
};

const API_DIRECTORY = path.resolve(`${__dirname}/../apis`);
const TARGET_DIRECTORY = path.resolve(`${__dirname}/../renderedTemplates`);
const TEMPLATE_DIRECTORY = path.resolve(`${__dirname}/../templatesOas`);

registerHelpers();
registerPartials();

console.log(`Creating SDK for ${API_DIRECTORY}`);

export function resolveApiName(name: string): string {  
    // Remove all whitespace and replace 'OAS' with an empty string
    return name.replace(/\s+/g, '').replace('OAS', '');
  }

export function getAPIDetailsFromExchange(directory: string): ApiSpecDetail {
    const exchangePath = path.join(directory, 'exchange.json');
    if (fs.existsSync(exchangePath)) {
      const exchangeConfig = fs.readJSONSync(exchangePath) as ExchangeConfig;
      return {
        filepath: path.join(directory, exchangeConfig.main),
        filename: exchangeConfig.main,
        directoryName: exchangeConfig.assetId.replace('-oas', ''),
        name: exchangeConfig.name,
        apiName: resolveApiName(exchangeConfig.name),
      };
    }
    throw new Error(`Exchange file does not exist for ${directory}`);
}

export function generateSDKs(apiSpecDetail: ApiSpecDetail): void {
    const {filepath, name, directoryName} = apiSpecDetail;
    const fileIsOASspec = filepath.includes('oas');
    if (fs.statSync(filepath).isFile() && fileIsOASspec) {
      try {
        console.log(`Generating SDK for ${name}`);
        const outputDir = `${TARGET_DIRECTORY}/${directoryName}`;
        generateFromOas.generateFromOas({
          inputSpec: `${filepath}`,
          outputDir: `${outputDir}`,
          templateDir: `${TEMPLATE_DIRECTORY}`,
          skipValidateSpec: true,
        });
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error(`Error generating SDK for ${name}: ${error}`);
      }
    }
  }

// Helper function to recursively find all directories
function getAllDirectories(basePath: string, relativePath: string = ''): string[] {
  const fullPath = path.join(basePath, relativePath);
  const directories: string[] = [];
  
  try {
    const items = fs.readdirSync(fullPath);
    
    for (const item of items) {
      const itemPath = path.join(fullPath, item);
      const relativeItemPath = relativePath ? path.join(relativePath, item) : item;
      
      if (fs.lstatSync(itemPath).isDirectory()) {
        directories.push(relativeItemPath);
        // Recursively get subdirectories
        directories.push(...getAllDirectories(basePath, relativeItemPath));
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${fullPath}:`, error);
  }
  
  return directories;
}

export function main(): void {
  console.log('Starting OAS generation script');
  fs.readdir(API_DIRECTORY, (err: Error, directories: string[]) => {
    if (err) {
      console.error('Error reading api directory:', err);
      return;
    }

    const apiSpecDetails: ApiSpecDetail[] = [];
    // Use the new recursive function instead of the simple filter
    const subDirectories: string[] = getAllDirectories(API_DIRECTORY);
    console.log('subDirectories: ', subDirectories);

    subDirectories.forEach((directory: string) => {
      try {
        const details = getAPIDetailsFromExchange(
          path.join(API_DIRECTORY, directory)
        );
        apiSpecDetails.push(details);
      } catch (error) {
        // Skip directories that don't have exchange.json files
        console.log(`Skipping directory ${directory}: ${error}`);
      }
    });

    apiSpecDetails.forEach((apiSpecDetail: ApiSpecDetail) => {
      generateSDKs(apiSpecDetail);
    });

    console.log(
      `OAS generation script completed. Files outputted to ${TARGET_DIRECTORY}`
    );
  });
}

main();