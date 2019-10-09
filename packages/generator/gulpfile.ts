import * as gulp from "gulp";

import { processRamlFile } from "./src/utils/parser";
import { createClient, createIndex } from "./src/utils/renderer";

import log from "fancy-log";

import del from "del";
import fs from "fs-extra";
import ts from "gulp-typescript";
import { WebApiBaseUnitWithDeclaresModelAndEncodesModel } from "webapi-parser";
const tsProject = ts.createProject("tsconfig.json");

const TMPDIR = "tmp-dist";

tsProject.config.include = [`${TMPDIR}/**/*.ts`];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
gulp.task("cleanTmp", (cb: any) => {
  log.info(`Removing ${TMPDIR} directory`);
  return del([`./${TMPDIR}`], cb);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
gulp.task("cleanDist", (cb: any) => {
  log.info(`Removing 'dist' directory`);
  return del(["dist"], cb);
});

gulp.task("clean", gulp.parallel("cleanTmp", "cleanDist"));

gulp.task(
  "renderTemplates",
  gulp.series("cleanTmp", async () => {
    const files = [
      {
        boundedContext: "shop",
        ramlFile: `${__dirname}/raml/shop/site.raml`
      }
    ];

    await fs.ensureDir(TMPDIR);

    for (const entry of files) {
      await processRamlFile(entry.ramlFile)
        .then((res: WebApiBaseUnitWithDeclaresModelAndEncodesModel) => {
          fs.writeFileSync(
            `${TMPDIR}/${entry.boundedContext}.ts`,
            createClient(res.encodes)
          );
        })
        .catch(err => {
          console.log(err);
        });
    }

    fs.writeFileSync(`${TMPDIR}/index.ts`, createIndex(files));
    return gulp.src("./src/core/**/*").pipe(gulp.dest(`./${TMPDIR}/core`));
  })
);

gulp.task("buildSdk", () => {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest("./dist"));
});

gulp.task("default", gulp.series("clean", "renderTemplates", "buildSdk"));
