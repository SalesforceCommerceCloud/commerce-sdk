/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import gql from "graphql-tag";
import "cross-fetch/polyfill";
import ApolloClient from "apollo-boost";

import { writeFileSync } from "fs";

import fetch from "node-fetch";

export function downloadAssets(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets: Array<any>,
  downloadFolder: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const promises: Promise<any>[] = [];
    const downloadedFolder = downloadFolder ? downloadFolder : "download";

    assets.forEach(asset => {
      const zipFilePath = `${downloadedFolder}/${asset.assetId}.zip`;

      asset.files.forEach(element => {
        if (element.classifier === "fat-raml") {
          promises.push(
            fetch(element.externalLink)
              .then(result => {
                return result.arrayBuffer();
              })
              .then(x => {
                writeFileSync(zipFilePath, Buffer.from(x));
              })
              .catch(e => {
                reject(e);
              })
          );
        }
      });
    });
    return Promise.all(promises).then(resolve);
  });
}

export function getRamlByTag(
  accessToken: string,
  tag: string,
  downloadFolder?: string
): Promise<void> {
  const client = new ApolloClient({
    uri: "https://anypoint.mulesoft.com/graph/api/v1/graphql"
  });
  return client
    .query({
      query: gql`
        {
          assets(
            query: { type: "rest-api", tags: [{ value: "${tag}" }] }
            latestVersionsOnly: true
          ) {
            assetId
            files {
              externalLink
              classifier
              packaging
            }
            type
          }
        }
      `,
      variables: {
        accessToken: accessToken
      }
    })
    .then(data => {
      if (data && data.data) {
        return downloadAssets(data.data.assets, downloadFolder);
      }
      return Promise.resolve();
    })
    .catch(error => console.error(error));
}
