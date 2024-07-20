import middy from "@middy/core";
import { default as httpJsonBodyParser } from "@middy/http-json-body-parser";
import { APIGatewayProxyResult } from "aws-lambda";
import { FromSchema } from "json-schema-to-ts";
import { refreshTokenByGoogle } from "../../../../lib/google/oauth.service";
import { ApiKeyVerifiedContext } from "../../../../lib/middlewares/auth.guard";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator";

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
export const apiSpec = {
  category    : "auth",
  method      : "POST",
  path        : "/v1/auth/google/refresh",
  summary     : "auth.google.refresh",
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
  const refreshed = await refreshTokenByGoogle(token);

  return {
    statusCode: 200,
    body: JSON.stringify({ ...refreshed }),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
