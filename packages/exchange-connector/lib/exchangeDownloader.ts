import gql from "graphql-tag";
import "cross-fetch/polyfill";
// import { graphql } from "graphql";
import ApolloClient from "apollo-boost";

import { writeFileSync } from "fs";

import fetch from "node-fetch";

export async function downloadAssets(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets: Array<any>,
  downloadFolder: string
): Promise<void> {
  assets.forEach(asset => {
    asset.files.forEach(async element => {
      if (element.classifier === "fat-raml") {
        await fetch(element.externalLink)
          .then(x => x.arrayBuffer())
          .then(x =>
            writeFileSync(
              `${downloadFolder ? downloadFolder : "download"}/${
                asset.assetId
              }`,
              Buffer.from(x)
            )
          );
      }
    });
  });
  return;
}

export async function getRamlByTag(
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
    .then(async data => {
      await downloadAssets(data.data.assets, downloadFolder);
    })
    .catch(error => console.error(error));
}
