import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { FromSchema } from "json-schema-to-ts";
import { TaskRepository } from "../../../../lib/ddb/task.repository.js";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";
import { ioLogger } from "../../../../lib/middlewares/io-logger.js";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator.js";
import {
  pathSchemaToParameters,
  requestContextSchema,
} from "../../../../lib/util/index.js";

const pathSchema = {
  type: "object",
  properties: {
    task_id: { type: "string" },
  },
  required: ["task_id"],
  additionalProperties: false,
} as const;

const eventSchema = {
  type: "object",
  properties: {
    pathParameters: pathSchema,
    requestContext: requestContextSchema,
  },
  required: ["pathParameters", "requestContext"],
} as const;

const responseSchema = {
  type: "object",
  properties: {
    message: { type: "string", example: "success" },
  },
};

// prettier-ignore
export const apiSchema = {
  path        : "/v1/tasks/{task_id}",
  method      : "delete",
  tags        : ["Task"],
  summary     : "Task.delete",
  description : "Delete a task",
  operationId : "deleteTask",
  parameters  : pathSchemaToParameters(pathSchema),
  responses: {
    200: {
      description: "",
      content: { "application/json": { schema: responseSchema } },
    },
  },
};

const taskRepository = new TaskRepository();
export async function lambdaHandler(event: FromSchema<typeof eventSchema>) {
  const task_id = event.pathParameters!.task_id;
  const user_email = event.requestContext.authorizer.lambda.email;

  await taskRepository.deleteTask(user_email, task_id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "success",
    }),
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(ioLogger())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
