import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import middy from "@middy/core";
import { APIGatewayEvent, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { BaseDynamoDBClass } from "../../lib/ddb/base.repository.js";
import { getUserInfoByGoogle } from "../../lib/google/oauth.service.js";
import { globalErrorHandler } from "../../lib/middlewares/global-error-handler.js";

const TABLE_NAME =
  (process.env.CONNECTIONS_TABLE as string) || "websocketTable";
const dynamoDb = new BaseDynamoDBClass(TABLE_NAME);

const connectHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  const connectionId = event.requestContext.connectionId;
  const token = event.queryStringParameters?.token || "";

  const { email } = await getUserInfoByGoogle(token);

  await dynamoDb.putItem({
    connectionId: connectionId,
    user_email: email,
    timestamp: Date.now(),
  });

  return {
    statusCode: 200,
    body: "Connected",
  };
};

const disconnectHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  const connectionId = event.requestContext.connectionId;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      connectionId: connectionId,
    },
  };

  await dynamoDb.deleteItem({ connectionId });

  return {
    statusCode: 200,
    body: "Disconnected",
  };
};

export const defaultHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  const connectionId = event.requestContext.connectionId;
  const message = event.body || "";

  // Handle the message, e.g., broadcast to all connections
  const scanParams = {
    ProjectionExpression: "connectionId",
  };

  const connectionData = await dynamoDb.scanItems<{
    connectionId: string;
  }>(scanParams);

  const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
    endpoint:
      "https://" +
      event.requestContext.domainName +
      "/" +
      event.requestContext.stage,
  });

  const postCalls = connectionData.map(async ({ connectionId }) => {
    try {
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(message, "utf-8"),
      });
      await apiGatewayManagementApi.send(command);
    } catch (e: any) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await dynamoDb.deleteItem({ connectionId });
      } else {
        throw e;
      }
    }
  });

  await Promise.all(postCalls || []);

  return {
    statusCode: 200,
    body: "Message sent",
  };
};

const lambdaHandler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const routeKey = event.requestContext.routeKey;

  switch (routeKey) {
    case "$connect":
      return connectHandler(event);
    case "$disconnect":
      return disconnectHandler(event);
    default:
      return defaultHandler(event);
  }
};

export const handler = middy(lambdaHandler).use(globalErrorHandler());
