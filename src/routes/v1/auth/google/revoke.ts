import middy from "@middy/core";
import { default as httpJsonBodyParser } from "@middy/http-json-body-parser";
import { APIGatewayProxyResult } from "aws-lambda";
import { FromSchema } from "json-schema-to-ts";
import { revokeTokenByGoogle } from "../../../../lib/google/oauth.service.js";
import { ApiKeyVerifiedContext } from "../../../../lib/middlewares/auth.guard.js";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator.js";
// prettier-ignore
const bodySchema = {
  type: "object",
  properties: {
    token: { type: "string", description: "access_token or refresh_token" },
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
    message: { type: "string", example: "success" },
  },
};

// prettier-ignore
export const apiSpec = {
  category    : "Auth",
  method      : "POST",
  path        : "/v1/auth/google/revoke",
  summary     : "auth.google.revoke",
  description : "토큰을 폐기한다.",
  requestBody : {
    required: true,
    content: { "application/json": { schema: bodySchema } },
  },
  responses: {
    200: {
      description: "",
      content: { "application/json": { schema: responseSchema } },
    },
    400: { $ref: "#/components/responses/Validation" },
    401: { $ref: "#/components/responses/Unauthorized" },
    403: { $ref: "#/components/responses/InsufficientScope" },
    404: { $ref: "#/components/responses/NotFound" },
    500: { $ref: "#/components/responses/InternalServerError" },
  },
};

export async function lambdaHandler(
  event: FromSchema<typeof eventSchema>,
  context: ApiKeyVerifiedContext
): Promise<APIGatewayProxyResult> {
  const { token } = event.body;
  await revokeTokenByGoogle(token);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "success" }),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
