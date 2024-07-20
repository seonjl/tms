import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { FromSchema } from "json-schema-to-ts";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator.js";
import { getSinglePartPresignedUrl } from "../../../../lib/s3/s3.service.js";
import { requestContextSchema } from "../../../../lib/util/index.js";

const bodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    metadata: { type: "object", additionalProperties: { type: "string" } }, // key-value pair only string
  },
  required: ["name"],
  additionalProperties: false,
} as const;

const eventSchema = {
  type: "object",
  properties: {
    requestContext: requestContextSchema,
    body: bodySchema,
  },
  required: ["requestContext", "body"],
} as const;

const responseSchema = {
  type: "object",
  properties: {
    url: { type: "string" },
  },
};

export async function lambdaHandler(event: FromSchema<typeof eventSchema>) {
  const user_email = event.requestContext.authorizer.lambda.email;
  const { name, metadata } = event.body;

  const url = await getSinglePartPresignedUrl({
    bucket: process.env.FILE_INVENTORY_BUCKET_NAME!,
    key: user_email + "/" + name,
    metadata: metadata,
  });

  return {
    statusCode: 200,
    body: {
      url: url,
    },
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
