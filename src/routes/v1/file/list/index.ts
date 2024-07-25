import middy from "@middy/core";
import { FromSchema } from "json-schema-to-ts";
import { FileRepository } from "../../../../lib/ddb/file.repository.js";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";
import { ioLogger } from "../../../../lib/middlewares/io-logger.js";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator.js";
import { requestContextSchema } from "../../../../lib/util/index.js";

const querySchema = {
  type: "object",
  properties: {
    "created_at>": {
      type: "string",
      description: "생성일시",
      example: "2024-06-01T00:00:00Z",
    },
    "created_at<": {
      type: "string",
      description: "생성일시",
      example: "2024-07-01T00:00:00Z",
    },
  },
  required: [],
  additionalProperties: false,
} as const;

const eventSchema = {
  type: "object",
  properties: {
    queryStringParameters: querySchema,
    requestContext: requestContextSchema,
  },
  required: ["requestContext"],
} as const;

const responseSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {},
  },
};

const fileRepository = new FileRepository();
export async function lambdaHandler(event: FromSchema<typeof eventSchema>) {
  const user_email = event.requestContext.authorizer.lambda.email;
  const files = await fileRepository.listFiles({
    user_email,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(files),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(ioLogger())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
