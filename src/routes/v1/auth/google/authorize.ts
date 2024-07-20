import middy from "@middy/core";
import { default as httpJsonBodyParser } from "@middy/http-json-body-parser";
import { APIGatewayProxyResult } from "aws-lambda";
import { FromSchema } from "json-schema-to-ts";
import {
  authorizeByGoogle,
  getUserInfoByGoogle,
} from "../../../../lib/google/oauth.service";
import { ApiKeyVerifiedContext } from "../../../../lib/middlewares/auth.guard";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator";

const bodySchema = {
  type: "object",
  properties: {
    code: { type: "string" },
    locale: { type: "string" },
  },
  required: ["code"],
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
    refresh_token: { type: "string" },
    expires_in: { type: "number" },
    scope: { type: "string" },
    token_type: { type: "string" },
    email: { type: "string" },
    name: { type: "string" },
  },
};

// prettier-ignore
export const apiSpec = {
  category    : "auth",
  method      : "POST",
  path        : "/v1/auth/google/authorize",
  summary     : "auth.google.authorize",
  description : "Google 회원가입/로그인을 처리한다. redirectUri 는 ${origin}/redirect/google",
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
  const origin = event.headers?.origin;
  const { code, locale } = event.body;

  const authorized = await authorizeByGoogle({
    code,
    redirectUri: `${origin}/redirect/google`,
  });

  const { email } = await getUserInfoByGoogle(authorized.access_token);

  // const response = await userRepository.login({ email, locale });

  return {
    statusCode: 200,
    body: JSON.stringify({ ...authorized, email }),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
