import { processRamlFile } from "./parser";
import { createDto } from "./renderer";
import { WebApiBaseUnit, WebApiBaseUnitWithDeclaresModel } from "webapi-parser";
import { RELEASES, TYPESCRIPT_DTO_EXT, SDK_DIR_TS } from "./config";
import * as path from "path";
import fs from "fs-extra";

export class TypeRenderer {
  constructor(public rootDir: string) {}

  async process(ramlFiles: any) {
    if (!this.rootDir || !ramlFiles) {
      return;
    }
    const sdkDir = path.join(this.rootDir, RELEASES, SDK_DIR_TS);
    await fs.ensureDir(sdkDir);
    for (const entry of ramlFiles) {
      const res = await processRamlFile(
        this.rootDir.concat(entry.ramlFile)
      ).then((res: WebApiBaseUnit) => {
        return res as WebApiBaseUnitWithDeclaresModel;
      });
      const ramlFileAbsolutePath = path.join(
        sdkDir,
        entry.boundedContext.concat(TYPESCRIPT_DTO_EXT)
      );
      fs.writeFileSync(ramlFileAbsolutePath, createDto(res.declares));
    }
  }
}
