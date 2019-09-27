import { processRamlFile } from "./utils/parser";
import { createClient, copyStaticFiles } from "./utils/renderer";

processRamlFile(`${__dirname}/../raml/shop/site.raml`)
  .then(res => {
    createClient(res.encodes);
  })
  .catch(err => {
    console.log(err);
  });

copyStaticFiles();
