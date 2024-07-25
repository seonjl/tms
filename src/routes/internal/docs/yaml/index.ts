import middy from "@middy/core";
import fs from "fs";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";

let openapiYaml: any;
export async function lambdaHandler() {
  if (openapiYaml === undefined) {
    const currentDir = fs.realpathSync(".");

    openapiYaml = fs.readFileSync(`${currentDir}/docs/openapi.yaml`, "utf8");
  }

  return {
    statusCode: 200,
    body: openapiYaml,
    headers: {
      "Content-Type": "text/yaml",
    },
  };
}

export const handler = middy().use(globalErrorHandler()).handler(lambdaHandler);
