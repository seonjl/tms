import middy from "@middy/core";
import { globalErrorHandler } from "../../../lib/middlewares/global-error-handler";

export async function lambdaHandler() {
  return {
    statusCode: 200,
    body: "OK",
  };
}

export const handler = middy().use(globalErrorHandler()).handler(lambdaHandler);
