import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

export async function lambdaHandler() {
  return {
    statusCode: 200,
    body: "OK",
  };
}

export const handler = middy().use(httpErrorHandler()).handler(lambdaHandler);
