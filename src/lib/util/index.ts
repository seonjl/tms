import { createError } from "@middy/util";

export const randomId = ({ prefix: _prefix }: { prefix?: string } = {}) => {
  const prefix = _prefix ? _prefix : Math.random().toString(36).substring(0, 6);

  return `${prefix}.${Math.random().toString(36).substring(2, 16)}`;
};

export const createJsonError = ({
  statusCode,
  code,
  message,
  ...opts
}: {
  statusCode: number;
  code: string;
  message: string;
  [key: string]: any;
}) => {
  const error = createError(statusCode, message, opts);

  error.statusCode = statusCode;
  error.code = code;
  error.message = JSON.stringify({ message, code });
  error.expose = true;

  return error;
};

export interface LambdaAuthorizerAuthorizedRequestContextByGoogle {
  lambda: {
    email: "roy@reconlabs.ai";
  };
}

export const requestContextSchema = {
  type: "object",
  properties: {
    authorizer: {
      type: "object",
      properties: {
        lambda: {
          type: "object",
          properties: {
            email: { type: "string" },
          },
          required: ["email"],
        },
      },
      required: ["lambda"],
    },
  },
  required: ["authorizer"],
} as const;

export interface APIGatewayProxyEventBodyModified<B = any>
  extends Omit<
    AWSLambda.APIGatewayProxyEventBase<LambdaAuthorizerAuthorizedRequestContextByGoogle>,
    "body"
  > {
  body: B;
}
export function removeUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export const ShouldExist = async <T>(
  target: T | undefined | Promise<T | undefined>,
  variables: Record<string, any> = {}
): Promise<T> => {
  const value = await target;

  // if value is undefined or empty array, throw not found error
  if (!value || (Array.isArray(value) && value.length === 0)) {
    const message = `${formatVariables(variables)} not found`;
    throw createJsonError({
      statusCode: 404,
      code: "NotFound",
      message,
    });
  }
  return value;
};

const formatVariables = (variables: Record<string, any>) => {
  return Object.entries(variables)
    .map(([key, value]) => `$${key}=${value}`)
    .join(", ");
};
