import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { FromSchema } from "json-schema-to-ts";
import { getDownloadPresignedUrl } from "../../../../lib/aws/s3.service.js";
import { FileRepository } from "../../../../lib/ddb/file.repository.js";
import { globalErrorHandler } from "../../../../lib/middlewares/global-error-handler.js";
import { userFriendlyValidator } from "../../../../lib/middlewares/user-friendly.validator.js";
import { randomId, requestContextSchema } from "../../../../lib/util/index.js";

const bodySchema = {
  type: "object",
  properties: {
    file_id: { type: "string" },
    name: { type: "string" },
  },
  required: ["file_id"],
  additionalProperties: false,
} as const;

const eventSchema = {
  type: "object",
  properties: {
    requestContext: requestContextSchema,
    body: bodySchema,
  },
  required: ["requestContext", "body"],
} as const;

const responseSchema = {
  type: "object",
  properties: {
    url: { type: "string" },
  },
};

export const apiSchema = {
  path: "/v1/files/download",
  method: "POST",
  tags: ["File"],
  summary: "File.download",
  description: "Create a presigned url for download",
  operationId: randomId({ prefix: "operation" }),
  requestBody: {
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

const fileRepository = new FileRepository();
export async function lambdaHandler(event: FromSchema<typeof eventSchema>) {
  const user_email = event.requestContext.authorizer.lambda.email;
  const { file_id, name } = event.body;

  const file = await fileRepository.getFile(user_email, file_id);

  console.log("📢 file");
  console.log(file);

  const url = await getDownloadPresignedUrl({
    bucket: file.bucket,
    key: file.key,
    downloadFileName: name || file.name,
  });

  return {
    statusCode: 200,
    body: {
      url: url,
    },
  };
}

export const handler = middy()
  .use(globalErrorHandler())
  .use(httpJsonBodyParser())
  .use(userFriendlyValidator({ eventSchema }))
  .handler(lambdaHandler);
