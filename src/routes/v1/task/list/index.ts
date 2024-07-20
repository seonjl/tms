import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { FromSchema } from "json-schema-to-ts";
import { TaskRepository } from "../../../../ddb/task.repository.js";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator.js";
import { requestContextSchema } from "../../../../lib/util/index.js";

const querySchema = {
  type: "object",
  properties: {
    "created_at>": {
      type: "string",
      description: "생성일시",
      example: "2024-06-01T00:00:00Z",
    },
    "created_at<": {
      type: "string",
      description: "생성일시",
      example: "2024-07-01T00:00:00Z",
    },
  },
  required: [],
  additionalProperties: false,
} as const;

const eventSchema = {
  type: "object",
  properties: {
    queryStringParameters: querySchema,
    requestContext: requestContextSchema,
  },
  required: ["requestContext"],
} as const;

const responseSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      task_id: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      task_status: { type: "string" },
      due_date: { type: "string" },
      created_at: { type: "string" },
    },
    required: [
      "task_id",
      "title",
      "description",
      "task_status",
      "due_date",
      "created_at",
    ],
  },
};

const taskRepository = new TaskRepository();
export async function lambdaHandler(event: FromSchema<typeof eventSchema>) {
  const user_email = event.requestContext.authorizer.lambda.email;
  const tasks = await taskRepository.listTasks({
    user_email,
  });

  return {
    statusCode: 200,
    body: tasks,
  };
}

export const handler = middy()
  .use(httpErrorHandler())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
