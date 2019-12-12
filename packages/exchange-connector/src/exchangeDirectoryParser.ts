/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import _ from "lodash";

const ramlGroupKey = "CC API Family";

function getFiles(directory): fs.Dirent[] {
  return fs.readdirSync(path.join(directory), {
    withFileTypes: true
  });
}

/**
 * Extracts zip files present in the given directory.
 * zip files are usually downloaded from Anypoint exchange
 * @param directory
 */
export function extractFiles(directory: string): Promise<any> {
  const files: fs.Dirent[] = getFiles(directory);
  const promises: Promise<any>[] = [];
  files.forEach(file => {
    if (file.isFile()) {
      promises.push(
        new Promise((resolve, reject) => {
          fs.createReadStream(
            path.join(path.resolve(directory), file.name)
          ).pipe(
            unzipper
              .Extract({
                path: path.join(
                  path.resolve(directory),
                  path.basename(file.name, ".zip")
                )
              })
              .on("error", reject)
              .on("close", resolve)
          );
        })
      );
    }
  });

  return Promise.all(promises);
}

/**
 * After extracting the zip files using extractFiles function,
 * this method parses the exchange.json if present and creates
 * metadata for further processing
 * @param directory
 */
function getMetadataFilesFromDirectory(directory: string): any[] {
  const files: fs.Dirent[] = getFiles(directory);

  const metaDataFiles = [];
  files.forEach(file => {
    const exchangeFile = path.join(
      path.resolve(directory),
      path.basename(file.name, ".zip"),
      "exchange.json"
    );

    if (file.isDirectory() && fs.existsSync(exchangeFile)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const exchangeJson = require(exchangeFile);
      metaDataFiles.push({
        ramlFile: path.join(
          path.resolve(directory),
          path.basename(file.name, ".zip"),
          exchangeJson["main"]
        ),
        categories: exchangeJson.categories
      });
    }
  });
  return metaDataFiles;
}

/**
 * decorates the metadata for the zip files present in the given directory
 * with bounded context information present inside the exchange.json
 * @param directory
 */
export function getConfigFilesFromDirectory(directory: string): any[] {
  const metaDataFiles = getMetadataFilesFromDirectory(directory);
  const configFiles = [];

  metaDataFiles.forEach(metaDataFile => {
    const categories = _.filter(
      metaDataFile["categories"],
      category =>
        category.key === ramlGroupKey &&
        Array.isArray(category.value) &&
        category.value.length > 0
    );

    if (categories && categories.length > 0) {
      configFiles.push({
        ramlFile: metaDataFile["ramlFile"],
        boundedContext: categories[0].value[0]
      });
    }
  });
  return configFiles;
}

/**
 * Slices the metadata for the zip files present in the given directory
 * by extracting only the RAML files
 * @param directory
 */
export function getRamlFromDirectory(directory: string): string[] {
  return getMetadataFilesFromDirectory(directory).map(
    configFile => configFile.ramlFile
  );
}
