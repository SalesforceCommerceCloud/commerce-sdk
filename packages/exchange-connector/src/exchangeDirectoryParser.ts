/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from "fs-extra";
import path from "path";
import unzipper from "unzipper";
import { RestApi } from "./exchangeTypes";

function getFiles(directory): fs.Dirent[] {
  return fs.readdirSync(path.join(directory), {
    withFileTypes: true
  });
}

/**
 * TODO: Tests need to be written.  There was only one test for this method and
 *       it just tested that the method did nothing with an empty dir
 * Extracts zip files present in the given directory.
 * zip files are usually downloaded from Anypoint exchange
 * @param directory
 */
export function extractFiles(
  directory: string,
  removeFiles = true
): Promise<void> {
  const files: fs.Dirent[] = getFiles(directory);
  const promises: Promise<void>[] = [];
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
              .on("finish", () => {
                if (removeFiles) {
                  console.log(
                    "Removing " + path.join(path.resolve(directory), file.name)
                  );
                  fs.removeSync(path.join(path.resolve(directory), file.name));
                }
                resolve();
              })
          );
        })
      );
    }
  });

  // The then here collapses the return from an array of void to a single void
  return Promise.all(promises).then();
}
