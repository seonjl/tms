import fs from "fs";
import path from "path";
// node --loader ts-node/esm scripts/generate-api-docs.ts
const __dirname = path.resolve();

function readDirectory(dir, result = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      readDirectory(fullPath, result);
    } else {
      result.push(fullPath);
    }
  });
  return result;
}

function generatePathsObject(apiSchema) {
  const paths = {};
  apiSchema.forEach((schema) => {
    const { url, method, operationId } = schema;
    paths[url] = {
      [method]: {
        operationId,
      },
    };
  });
  return paths;
}

function generateOperationObject(apiSchema) {}

async function main() {
  const targetFiles = readDirectory("./dist");
  console.log("📢 targetFiles");
  console.log(targetFiles);

  const openapiObject = {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
    },
    paths: {},
  };

  const targetApiSchemas = targetFiles.map((file) => __dirname + "/" + file);
  // .map(async (file) => {
  //   try {
  //     const imported = await import(file);
  //     return imported.apiSchema || null;
  //   } catch (error) {
  //     console.log("📢 error");
  //     console.log(error);
  //   }
  // })
  // .filter(Boolean);

  console.log("📢 targetApiSchemas");
  const imported = await import(
    __dirname + "/dist/routes/v1/file/download/index.js"
  );

  console.log("📢 imported");
  console.log(imported);

  // const paths = generatePathsObject(targetApiSchemas);
}

// iife
(() => {
  main();
})();
