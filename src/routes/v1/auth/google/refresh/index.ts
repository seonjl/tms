import middy from "@middy/core";
import { default as httpJsonBodyParser } from "@middy/http-json-body-parser";
import { APIGatewayProxyResult } from "aws-lambda";
import { FromSchema } from "json-schema-to-ts";
import { refreshTokenByGoogle } from "../../../../../lib/google/oauth.service.js";
import { ApiKeyVerifiedContext } from "../../../../../lib/middlewares/auth.guard.js";
import { globalErrorHandler } from "../../../../../lib/middlewares/global-error-handler.js";
import { ioLogger } from "../../../../../lib/middlewares/io-logger.js";
import { userFriendlyValidator } from "../../../../../lib/middlewares/user-friendly.validator.js";

// prettier-ignore
const bodySchema = {
  type: "object",
  properties: {
    token: { type: "string", description: "refresh_token" },
  },
  required: ["token"],
  additionalProperties: false,
} as const;

const eventSchema = {
  type: "object",
  properties: {
    headers: { type: "object" },
    body: bodySchema,
  },
  required: ["body"],
} as const;

const responseSchema = {
  type: "object",
  properties: {
    access_token: { type: "string" },
    expires_in: { type: "number" },
    token_type: { type: "string" },
    scope: { type: "string" },
  },
};

// prettier-ignore
export const apiSchema = {
  path        : "/v1/auth/google/refresh",
  method      : "post",
  tags        : ["Auth"],
  summary     : "Auth.google.refresh",
  description : "access_token 토큰을 갱신한다.",
  requestBody : {
    required: true,
    content: { "application/json": { schema: bodySchema } },
  },
  responses: {
    200: {
      description: "",
      content: { "application/json": { schema: responseSchema } },
    },
  },
};

export async function lambdaHandler(
  event: FromSchema<typeof eventSchema>,
  context: ApiKeyVerifiedContext
): Promise<APIGatewayProxyResult> {
  const { token } = event.body;
  const refreshed = await refreshTokenByGoogle(token);

  return {
    statusCode: 200,
    body: JSON.stringify({ ...refreshed }),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(ioLogger())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
