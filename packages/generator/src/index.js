import { processRamlFile } from "./utils/parser";
import { createClient, copyStaticFiles, createIndex } from "./utils/renderer";

// This lets us read in multiple files for now.  Should be replaced in the future
let files = [
  {
    boundedContext: "shop",
    ramlFile: `${__dirname}/../raml/shop/site.raml`
  }
];

files.forEach(entry => {
  processRamlFile(entry.ramlFile)
    .then(res => {
      createClient(res.encodes, entry.boundedContext);
    })
    .catch(err => {
      console.log(err);
    });
});

createIndex(files);

copyStaticFiles();
