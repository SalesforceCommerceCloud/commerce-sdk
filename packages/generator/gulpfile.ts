
import * as gulp from "gulp";

import { processRamlFile } from "./src/utils/parser";
import { createClient, createIndex } from "./src/utils/renderer";

const del = require("del");

const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');


gulp.task("buildInt", () => {
    let files = [
        {
          boundedContext: "shop",
          ramlFile: `${__dirname}/raml/shop/site.raml`
        }
      ];
      
    files.forEach(entry => {
        processRamlFile(entry.ramlFile)
            .then((res: any) => {
                createClient(res.encodes, entry.boundedContext);
            })
            .catch((err: any) => {
                console.log(err);
            });
    });
      
    createIndex(files);

    return gulp.src("./src/core/**/*").pipe(gulp.dest("./pkg/core"));
});

gulp.task('default', () => console.log('default'));

gulp.task('clean', (cb: any) => {
    return del(["./pkg"], cb);
});

gulp.task('buildSdk', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'));
});
