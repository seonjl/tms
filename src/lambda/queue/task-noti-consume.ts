import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import middy from "@middy/core";
import sqsBatch from "@middy/sqs-partial-batch-failure";
import { jsonSafeParse } from "@middy/util";
import { SQSEvent } from "aws-lambda";

import { BaseDynamoDBClass } from "../../lib/ddb/base.repository.js";

const connRepository = new BaseDynamoDBClass("websocketTable");

// {
//   Records: [
//     {
//       messageId: 'd0fd6ed1-b344-4026-b601-dabff0b8dc41',
//       receiptHandle: 'AQEB1ZWVU4ecc6rjBaapf8ejY7DFErdJPst10t+lsM7UkNDWwtKxYywJfASSER7EMMGJfn8tZWOBUH48H7fZnrnzMMu/5WuE68eM8FbNFFq9vipPLIHSREySQebP6ej87RrPxZE0ORBCCKijnsZDFzfnE6YOuezDohtWWEelVsiYaqC8w5mySZHmZFmXgxlDd+9ZmnATasRKUYrzN9aw1G+QsTPjkHqBgVM0Bt8tkzQvtyEBh9aisGb9yWKmIExJSFBqsGS5BHeR1DWRpHo6ZTVBXdHaS4JTVupZBESLqhPxwE63e4du8Pbj4u005azGsAu+7sWsIB2pkvjL5RP4U17wagr19K4RYPk/LbIQrAV0jftApllTaXA9GBXFudIYO4e6m/lpNYn1dC8PLcTI/lQeZX6EpWNE5qB5tuXCkCIfvao=',
//       body: '{\n' +
//         '  "Type" : "Notification",\n' +
//         '  "MessageId" : "4470e13f-72be-5c1e-b3f8-be1c9ede67dd",\n' +
//         '  "TopicArn" : "arn:aws:sns:ap-northeast-2:905418160644:task-changed-notification-topic",\n' +
//         '  "Message" : "{\\"user_email\\":\\"seonjl.dev@gmail.com\\",\\"task_id\\":\\"task.23fb530ajgw\\"}",\n' +
//         '  "Timestamp" : "2024-07-31T07:39:12.558Z",\n' +
//         '  "SignatureVersion" : "1",\n' +
//         '  "Signature" : "ik9/IiklLK/YC8BTvQjkbIVBhcJ7nez6myVSLNhN2ZqK8eJE3PFYuIDa6QM2c5NJpxVnyxkjq6dpPQ1dZSuVHPyVm3b8j5S+UWREpRf7CYHRQNcOfrhXD8yse7VDCB3YtQyQRGzVkJNq/D9+R29xmzMvonTcCEhBVB7msQG4NNEJj3aV+6Foomzv/M/Ae2beNvxyOEiv5w1B36Z9/Gxld8sRoGKQnoyHY5rcrGwLYFL8EmM2nX+2QZ/tQ3ftKB8zEZnL8nVvplaNGkbO0+DVfzDVSEPrDnomutCzyN8p3MPxijLOLaPi+893syksiD3kak1R8DMUcZii/cC3E/WuPA==",\n' +
//         '  "SigningCertURL" : "https://sns.ap-northeast-2.amazonaws.com/SimpleNotificationService-60eadc530605d63b8e62a523676ef735.pem",\n' +
//         '  "UnsubscribeURL" : "https://sns.ap-northeast-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:ap-northeast-2:905418160644:task-changed-notification-topic:2b98aac6-9e45-49e5-a166-4f239d5a07f9"\n' +
//         '}',
//       attributes: [Object],
//       messageAttributes: {},
//       md5OfBody: '868bd8dd12d1948193ada2b6229fa223',
//       eventSource: 'aws:sqs',
//       eventSourceARN: 'arn:aws:sqs:ap-northeast-2:905418160644:task-changed-notification-queue',
//       awsRegion: 'ap-northeast-2'
//     }
//   ]
// }
export async function lambdaHandler(event: SQSEvent) {
  const recordPromises = event.Records.map(async (record, index) => {
    const body = jsonSafeParse(record.body);
    const {
      user_email,
      task_id,
      related_users = ["seonjl.dev@gmail.com"],
    } = body.Message;

    const connectionData = await connRepository.scanItems<{
      connectionId: string;
      user_email: string;
    }>({
      FilterExpression: `user_email IN (${related_users
        .map((_: any, index: number) => `:user_email${index}`)
        .join(", ")})`,
      ExpressionAttributeValues: related_users.reduce(
        (acc: any, email: string, index: number) => {
          acc[`:user_email${index}`] = email;
          return acc;
        },
        {}
      ),
    });

    const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
      endpoint:
        "https://1bcv3s9keh.execute-api.ap-northeast-2.amazonaws.com/production",
    });

    const message = { "message-type": "task-changed", task_id: "task_id" };
    const postCalls = connectionData.map(async ({ connectionId }) => {
      try {
        const command = new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(JSON.stringify(message), "utf-8"),
        });
        await apiGatewayManagementApi.send(command);
      } catch (e: any) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await connRepository.deleteItem({ connectionId });
        } else {
          throw e;
        }
      }
    });

    return Promise.allSettled(postCalls);
  });

  return Promise.allSettled(recordPromises);
}

export const handler = middy().use(sqsBatch()).handler(lambdaHandler);
