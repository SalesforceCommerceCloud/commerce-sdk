/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import "cross-fetch/polyfill";

import { writeFileSync, ensureDirSync } from "fs-extra";

import fetch, { Response } from "node-fetch";
import path from "path";

import { RestApi, FileInfo, Categories } from "./exchangeTypes";

const DEFAULT_DOWNLOAD_FOLDER = "download";

export function downloadRestApi(
  restApi: RestApi,
  destinationFolder: string = DEFAULT_DOWNLOAD_FOLDER
): Promise<void | Response> {
  return new Promise((resolve, reject) => {
    if (!restApi.fatRaml) {
      reject(
        new Error(
          `Fat RAML download information for ${restApi.assetId} is missing`
        )
      );
    }

    ensureDirSync(destinationFolder);

    const zipFilePath = path.join(destinationFolder, `${restApi.assetId}.zip`);

    let ret: Response;
    return fetch(restApi.fatRaml.externalLink)
      .then(result => {
        ret = result;
        return result.arrayBuffer();
      })
      .then(x => {
        writeFileSync(zipFilePath, Buffer.from(x));
        resolve(ret);
      });
  });
}

export function downloadRestApis(
  restApi: Array<RestApi>,
  destinationFolder: string = DEFAULT_DOWNLOAD_FOLDER
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promises: Promise<any>[] = [];

  restApi.forEach((api: RestApi) => {
    promises.push(downloadRestApi(api, destinationFolder));
  });

  return Promise.all(promises).then(() => destinationFolder);
}

function mapCategories(categories): Categories {
  const cats: Categories = {};
  categories.forEach(category => {
    cats[category["key"]] = category["value"];
  });
  return cats;
}

function getFileByClassifier(files, classifier): FileInfo {
  let myFile: FileInfo;
  files.forEach(file => {
    if (file["classifier"] === classifier) {
      myFile = {
        classifier: file["classifier"],
        packaging: file["packaging"],
        externalLink: file["externalLink"],
        createdDate: file["createdDate"],
        md5: file["md5"],
        sha1: file["sha1"],
        mainFile: file["mainFile"]
      };
    }
  });
  return myFile;
}

export function searchExchange(
  accessToken: string,
  searchString: string
): Promise<RestApi[]> {
  return fetch(
    `https://anypoint.mulesoft.com/exchange/api/v2/assets?search=${searchString}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
    .then(res => res.json())
    .then(restApis => {
      const apis: RestApi[] = [];
      restApis.forEach(restApi => {
        apis.push({
          name: restApi["name"],
          groupId: restApi["groupId"],
          assetId: restApi["assetId"],
          version: restApi["version"],
          categories: mapCategories(restApi["categories"]),
          fatRaml: getFileByClassifier(restApi["files"], "fat-raml")
        });
      });
      return apis;
    });
}
