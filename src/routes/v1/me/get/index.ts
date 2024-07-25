import middy from "@middy/core";
import { FromSchema } from "json-schema-to-ts";
import { UserRepository } from "../../../../lib/ddb/user.repository.js";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";
import { ioLogger } from "../../../../lib/middlewares/io-logger.js";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator.js";
import {
  createJsonError,
  requestContextSchema,
} from "../../../../lib/util/index.js";

const eventSchema = {
  type: "object",
  properties: {
    requestContext: requestContextSchema,
  },
  required: ["requestContext"],
} as const;

const responseSchema = {
  type: "object",
  properties: {
    email: { type: "string" },
  },
  required: ["email"],
};

// prettier-ignore
export const apiSchema = {
  path        : "/v1/me",
  method      : "get",
  tags        : ["Me"],
  summary     : "Me.get",
  description : "Get my information",
  operationId : "getMe",
  responses: {
    200: {
      description: "",
      content: { "application/json": { schema: responseSchema } },
    },
  },
};

const userRepository = new UserRepository();

export async function lambdaHandler(event: FromSchema<typeof eventSchema>) {
  const user_email = event.requestContext.authorizer.lambda.email;
  const user = await userRepository.getUser(user_email);

  if (!user) {
    throw createJsonError({
      statusCode: 404,
      message: "User not found",
      code: "UserNotFound",
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      email: user_email,
      ...user,
    }),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(ioLogger())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
