import middy from "@middy/core";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

export const ioLogger = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Error,
  Context
> => {
  const requestEventLogger: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Error,
    Context
  > = async (request) => {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    console.log("📢 request.context.awsRequestId");
    console.log(request.context.awsRequestId);
    console.log("📢 request.event");
    console.log(JSON.stringify(request.event));
  };

  const responseEventLogger: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Error,
    Context
  > = async (request) => {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    console.log("📢 request.response");
    console.log(JSON.stringify(request?.response));
  };

  return {
    before: requestEventLogger,
    after: responseEventLogger,
    onError: responseEventLogger,
  };
};
