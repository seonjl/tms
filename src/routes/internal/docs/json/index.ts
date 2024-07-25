import middy from "@middy/core";
import fs from "fs";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";

let openapiJson: any;
export async function lambdaHandler() {
  if (openapiJson === undefined) {
    const currentDir = fs.realpathSync(".");

    openapiJson = fs.readFileSync(`${currentDir}/docs/openapi.json`, "utf8");
  }

  return {
    statusCode: 200,
    body: openapiJson,
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export const handler = middy().use(globalErrorHandler()).handler(lambdaHandler);
