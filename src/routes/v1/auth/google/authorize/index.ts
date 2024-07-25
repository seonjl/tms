import middy from "@middy/core";
import { default as httpJsonBodyParser } from "@middy/http-json-body-parser";
import { APIGatewayProxyResult } from "aws-lambda";
import { FromSchema } from "json-schema-to-ts";
import { UserRepository } from "../../../../../lib/ddb/user.repository.js";
import {
  authorizeByGoogle,
  getUserInfoByGoogle,
} from "../../../../../lib/google/oauth.service.js";
import { ApiKeyVerifiedContext } from "../../../../../lib/middlewares/auth.guard.js";
import { globalErrorHandler } from "../../../../../lib/middlewares/global-error-handler.js";
import { ioLogger } from "../../../../../lib/middlewares/io-logger.js";
import { userFriendlyValidator } from "../../../../../lib/middlewares/user-friendly.validator.js";

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
  },
  required: [
    "access_token",
    "refresh_token",
    "expires_in",
    "scope",
    "token_type",
    "email",
  ],
};

// prettier-ignore
export const apiSchema = {
  path        : "/v1/auth/google/authorize",
  method      : "post",
  tags        : ["Auth"],
  summary     : "Auth.google.authorize",
  description : "Google 회원가입/로그인을 처리한다. redirectUri 는 ${origin}/redirect/google",
  operationId : "googleAuthorize",
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

const userRepository = new UserRepository();

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

  const response = await userRepository.createUser(email, {
    name: undefined,
    mobile: undefined,
    locale,
    provider: "google",
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ ...authorized, email }),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(ioLogger())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
