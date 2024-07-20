import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { FromSchema } from "json-schema-to-ts";
import { TaskRepository } from "../../../../ddb/task.repository.js";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator.js";
import { requestContextSchema } from "../../../../lib/util/index.js";

const bodySchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
  },
  required: ["title", "description"],
  additionalProperties: false,
} as const;

const eventSchema = {
  type: "object",
  properties: {
    body: bodySchema,
    requestContext: requestContextSchema,
  },
  required: ["body", "requestContext"],
} as const;

const responseSchema = {
  type: "object",
  properties: {
    message: { type: "string", example: "success" },
  },
};

const taskRepository = new TaskRepository();
export async function lambdaHandler(event: FromSchema<typeof eventSchema>) {
  const { title, description } = event.body;
  const user_email = event.requestContext.authorizer.lambda.email;

  await taskRepository.createTask(user_email, {
    title,
    description,
  });

  return {
    statusCode: 201,
    body: {
      message: "success",
    },
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
