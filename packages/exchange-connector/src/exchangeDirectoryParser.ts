/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from "fs";
import path from "path";
import unzipper from "unzipper";

function getFiles(directory): fs.Dirent[] {
  return fs.readdirSync(path.join(directory), {
    withFileTypes: true
  });
}

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

export function getRamlFromDirectory(directory: string): string[] {
  const files: fs.Dirent[] = getFiles(directory);

  const ramlFiles: string[] = [];
  files.forEach(file => {
    const exchangeFile = path.join(
      path.resolve(directory),
      path.basename(file.name, ".zip"),
      "exchange.json"
    );
    if (file.isDirectory() && fs.existsSync(exchangeFile)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const exchangeJson = require(exchangeFile);

      ramlFiles.push(
        path.join(
          path.resolve(directory),
          path.basename(file.name, ".zip"),
          exchangeJson["main"]
        )
      );
    }
  });

  return ramlFiles;
}
