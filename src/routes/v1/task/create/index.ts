import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { FromSchema } from "json-schema-to-ts";
import { TaskRepository } from "../../../../lib/ddb/task.repository.js";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";
import { ioLogger } from "../../../../lib/middlewares/io-logger.js";
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

// prettier-ignore
export const apiSchema = {
  path        : "/v1/tasks",
  method      : "post",
  tags        : ["Task"],
  summary     : "Task.create",
  description : "Create a task",
  operationId : "createTask",
  requestBody : {
    required: true,
    content: { "application/json": { schema: bodySchema } },
  },
  responses: {
    201: {
      description: "",
      content: { "application/json": { schema: responseSchema } },
    },
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
    body: JSON.stringify({
      message: "success",
    }),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(ioLogger())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
