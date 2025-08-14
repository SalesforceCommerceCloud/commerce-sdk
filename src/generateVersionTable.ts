/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from "fs";
import * as path from "path";

interface ApiVersion {
  name: string;
  version: string;
}

function extractApiVersionsFromDirectory(apisDir: string): ApiVersion[] {
  const apiVersions: ApiVersion[] = [];

  try {
    const entries = fs.readdirSync(apisDir, { withFileTypes: true });

    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const dirName = entry.name;

        // Parse directory name pattern: {api-name}-oas-{version}
        const match = /^(.+)-oas-(.+)$/.exec(dirName);

        if (match) {
          const apiName = match[1];
          const version = match[2];

          apiVersions.push({
            name: apiName,
            version,
          });
        }
      }
    });
  } catch (error) {
    console.error("Error reading APIs directory:", error);
    process.exit(1);
  }

  return apiVersions;
}

function generateVersionTable(apiVersions: ApiVersion[]): string {
  let table = "### API Versions\n\n";
  table += "| API Name | API Version |\n";
  table += "|----------|-------------|\n";

  apiVersions.forEach((api) => {
    table += `| ${api.name} | ${api.version} |\n`;
  });

  return table;
}

function updateChangelog(changelogPath: string, versionTable: string) {
  try {
    let changelogContent = fs.readFileSync(changelogPath, "utf8");

    // Find the most recent version section (first ## heading)
    const versionSectionMatch = /(## .+?\n\n)/.exec(changelogContent);

    if (versionSectionMatch) {
      const versionSectionStart = changelogContent.indexOf(
        versionSectionMatch[0]
      );
      const versionSectionEnd =
        versionSectionStart + versionSectionMatch[0].length;

      // Check if API Versions section already exists in this version
      const versionContent = changelogContent.substring(versionSectionEnd);
      const nextVersionMatch = /\n## /.exec(versionContent);
      const versionContentEnd = nextVersionMatch
        ? versionSectionEnd + nextVersionMatch.index
        : changelogContent.length;

      const currentVersionContent = changelogContent.substring(
        versionSectionEnd,
        versionContentEnd
      );

      // Check if API Versions section already exists in this version
      const apiVersionsRegex = /### API Versions[\s\S]*?(?=\n### |\n## |$)/;

      if (apiVersionsRegex.test(currentVersionContent)) {
        // Replace existing API Versions section in this version
        const updatedVersionContent = currentVersionContent.replace(
          apiVersionsRegex,
          versionTable
        );
        changelogContent =
          changelogContent.substring(0, versionSectionEnd) +
          updatedVersionContent +
          changelogContent.substring(versionContentEnd);
      } else {
        // Insert API Versions section at the top of this version's content
        const updatedVersionContent = `${versionTable}\n\n${currentVersionContent}`;
        changelogContent =
          changelogContent.substring(0, versionSectionEnd) +
          updatedVersionContent +
          changelogContent.substring(versionContentEnd);
      }
    } else {
      // If no version sections found, append to the end
      changelogContent += `\n\n${versionTable}`;
    }

    fs.writeFileSync(changelogPath, changelogContent, "utf8");
    console.log("✅ Successfully updated CHANGELOG.md with API version table");
  } catch (error) {
    console.error("Error updating CHANGELOG.md:", error);
    process.exit(1);
  }
}

function main() {
  const apiVersions = extractApiVersionsFromDirectory(
    path.join(__dirname, "../apis")
  );
  const versionTable = generateVersionTable(apiVersions);
  console.log("Generated version table:");
  console.log(versionTable);
  updateChangelog(path.join(__dirname, "../CHANGELOG.md"), versionTable);
}

if (require.main === module) {
  main();
}
