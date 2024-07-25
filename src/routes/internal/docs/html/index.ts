import middy from "@middy/core";
import fs from "fs";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";

let openapiHtml: any;
export async function lambdaHandler() {
  if (openapiHtml === undefined) {
    const currentDir = fs.realpathSync(".");

    openapiHtml = fs.readFileSync(`${currentDir}/docs/openapi.html`, "utf8");
  }

  return {
    statusCode: 200,
    body: openapiHtml,
    headers: {
      "Content-Type": "text/html",
    },
  };
}

export const handler = middy().use(globalErrorHandler()).handler(lambdaHandler);
