import * as fs from 'fs';
import * as path from 'path';

interface ApiVersion {
  name: string;
  version: string;
}

/**
 * Extracts API name and version from directory name
 * Example: "assignments-oas-1.0.35" -> { name: "assignments", version: "1.0.35" }
 */
function extractApiInfo(dirName: string): ApiVersion | null {
  // Match pattern like "api-name-oas-version"
  const match = dirName.match(/^(.+)-oas-(.+)$/);
  if (!match) {
    return null;
  }
  
  const apiName = match[1];
  const version = match[2];
  
  // Validate version format (should be like 1.0.35, 2.0.16, etc.)
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    return null;
  }
  
  return { name: apiName, version };
}

/**
 * Scans the apis directory and extracts all API versions
 */
function scanApisDirectory(): ApiVersion[] {
  const apisDir = path.join(process.cwd(), 'apis');
  const apis: ApiVersion[] = [];
  
  if (!fs.existsSync(apisDir)) {
    console.error('apis directory not found');
    return apis;
  }
  
  const apiDirs = fs.readdirSync(apisDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const apiDir of apiDirs) {
    const apiPath = path.join(apisDir, apiDir);
    const versionDirs = fs.readdirSync(apiPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const versionDir of versionDirs) {
      const apiInfo = extractApiInfo(versionDir);
      if (apiInfo) {
        apis.push(apiInfo);
      }
    }
  }
  
  return apis;
}

/**
 * Generates the API version table markdown
 */
function generateApiVersionTable(apis: ApiVersion[]): string {
  if (apis.length === 0) {
    return '';
  }
  // Sort by API name, then version (descending)
  apis.sort((a, b) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name);
    return compareVersions(b.version, a.version); // descending version
  });
  const table = [
    '| API Name | API Version |',
    '|----------|-------------|',
    ...apis.map(api => `| ${api.name} | ${api.version} |`)
  ].join('\n');
  
  return `\n### API Versions\n\n${table}\n`;
}

/**
 * Compares two version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

/**
 * Updates the CHANGELOG.md file with the API version table under the latest version section
 */
function updateChangelog(apiTable: string): void {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  
  if (!fs.existsSync(changelogPath)) {
    console.error('CHANGELOG.md not found');
    return;
  }
  
  let content = fs.readFileSync(changelogPath, 'utf8');
  
  // Find the first version section (## vX.Y.Z)
  const versionSectionRegex = /^(## v\d+\.\d+\.\d+\s*)$/m;
  const match = content.match(versionSectionRegex);
  
  if (!match) {
    console.error('No version section found in CHANGELOG.md');
    return;
  }
  
  // Remove any existing API Versions table under the first version section
  const apiTableRegex = /(## v\d+\.\d+\.\d+\s*)(\n### API Versions\n[\s\S]*?)(?=\n## |\n#|$)/m;
  if (apiTableRegex.test(content)) {
    content = content.replace(apiTableRegex, `$1`); // Remove old table
  }

  // Insert the table after the first version header
  const insertIndex = match.index! + match[0].length;
  const beforeSection = content.substring(0, insertIndex);
  const afterSection = content.substring(insertIndex);
  
  const updatedContent = beforeSection + apiTable + afterSection;
  
  fs.writeFileSync(changelogPath, updatedContent, 'utf8');
  console.log('Successfully updated CHANGELOG.md with API version table');
}

/**
 * Main function
 */
function main(): void {
  console.log('Scanning apis directory for API versions...');
  
  const allApis = scanApisDirectory();
  console.log(`Found ${allApis.length} API versions`);
  
  const apiTable = generateApiVersionTable(allApis);
  
  if (apiTable) {
    updateChangelog(apiTable);
    console.log('API version table generated successfully');
  } else {
    console.log('No valid API versions found');
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { main, scanApisDirectory, generateApiVersionTable }; 