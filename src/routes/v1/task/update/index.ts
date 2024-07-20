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
    task_status: { type: "string" },
    due_date: { type: "string" },
  },
  required: [],
  additionalProperties: false,
  minProperties: 1,
} as const;

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
    body: bodySchema,
    pathParameters: pathSchema,
    requestContext: requestContextSchema,
  },
  required: ["body", "pathParameters", "requestContext"],
} as const;

const responseSchema = {
  type: "object",
  properties: {
    message: { type: "string", example: "success" },
  },
};

const taskRepository = new TaskRepository();
export async function lambdaHandler(event: FromSchema<typeof eventSchema>) {
  const task_id = event.pathParameters!.task_id;
  const { title, description, task_status, due_date } = event.body;
  const user_email = event.requestContext.authorizer.lambda.email;

  await taskRepository.updateTask(user_email, task_id, {
    title,
    description,
    task_status,
    due_date,
  });

  return {
    statusCode: 200,
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