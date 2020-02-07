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
const ANYPOINT_BASE_URI = "https://anypoint.mulesoft.com/exchange/api/v2";

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

function convertResponseToRestApi(apiResponse: JSON): RestApi {
  return {
    id: apiResponse["id"],
    name: apiResponse["name"],
    description: apiResponse["description"],
    updatedDate: apiResponse["updatedDate"],
    groupId: apiResponse["groupId"],
    assetId: apiResponse["assetId"],
    version: apiResponse["version"],
    categories: mapCategories(apiResponse["categories"]),
    fatRaml: getFileByClassifier(apiResponse["files"], "fat-raml")
  };
}

/**
 * @description Get an asset from exchange.  This can be any of the following patterns
 *  * /groupId/assetId/version
 *  * /groupId/assetId
 *  * /groupId
 *
 * @export
 * @param {string} accessToken
 * @param {string} assetId
 * @returns {Promise<JSON>}
 */
export function getAsset(accessToken: string, assetId: string): Promise<JSON> {
  return fetch(`${ANYPOINT_BASE_URI}/assets/${assetId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }).then(res => {
    if (!res.ok) {
      throw new Error(`${res.status} - ${res.statusText}`);
    }
    return res.json();
  });
}

/**
 * @description Searches exchange and gets a list of apis based on the search string
 * @export
 * @param {string} accessToken
 * @param {string} searchString
 * @returns {Promise<RestApi[]>}
 */
export function searchExchange(
  accessToken: string,
  searchString: string
): Promise<RestApi[]> {
  return fetch(`${ANYPOINT_BASE_URI}/assets?search=${searchString}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(res => res.json())
    .then(restApis => {
      const apis: RestApi[] = [];
      restApis.forEach(restApi => {
        apis.push(convertResponseToRestApi(restApi));
      });
      return apis;
    });
}

/**
 * @description Looks at all versions of an api in exchange for an instance that matched the deployment regex
 *
 * @export
 * @param {string} accessToken
 * @param {RestApi} restApi
 * @param {RegExp} deployment
 * @returns {Promise<string>} Returned the version string that matches the regex passed.  Will return first found result
 */
export function getVersionByDeployment(
  accessToken: string,
  restApi: RestApi,
  deployment: RegExp
): Promise<string> {
  return getAsset(accessToken, `${restApi.groupId}/${restApi.assetId}`).then(
    asset => {
      let version = null;
      asset["instances"].forEach(
        (instance: { environmentName: string; version: string }) => {
          if (
            instance.environmentName &&
            deployment.test(instance.environmentName) &&
            version === null
          ) {
            version = instance.version;
          }
        }
      );

      return version;
    }
  );
}

/**
 * @description Gets details on a very specific api version combination
 * @export
 * @param {string} accessToken
 * @param {string} groupId
 * @param {string} assetId
 * @param {string} version
 * @returns {Promise<RestApi>}
 */
export function getSpecificApi(
  accessToken: string,
  groupId: string,
  assetId: string,
  version: string
): Promise<RestApi> {
  if (version == null) {
    return null;
  }
  return getAsset(accessToken, `${groupId}/${assetId}/${version}`).then(api => {
    return convertResponseToRestApi(api);
  });
}
