import type { DynamoDBStreamEvent } from "aws-lambda";
import { publish } from "../../lib/aws/sns.service.js";

type ERecord = {
  eventID: "8c059f93b836098a3a2c908f075182d4";
  eventName: "INSERT";
  eventVersion: "1.1";
  eventSource: "aws:dynamodb";
  awsRegion: "ap-northeast-2";
  dynamodb: {
    ApproximateCreationDateTime: 1719284880;
    Keys: {
      user_email: {
        S: "roy@reconlabs.ai";
      };
    };
    NewImage: {
      user_email: {
        S: "roy@reconlabs.ai";
      };
      last_logged_in: {
        S: "2024-06-25T03:15:56.271Z";
      };
      updated_at: {
        S: "2024-06-25T03:15:56.272Z";
      };
      name: {
        S: "Roy";
      };
      created_at: {
        S: "2024-06-25T03:15:56.272Z";
      };
      locale: {
        S: "en";
      };
    };
    SequenceNumber: "100000000016389203877";
    SizeBytes: 173;
    StreamViewType: "NEW_IMAGE";
  };
  eventSourceARN: "arn:aws:dynamodb:ap-northeast-2:207637378596:table/3dapi-stag-user-table/stream/2024-06-25T02:52:18.102";
};

export async function handler(event: DynamoDBStreamEvent) {
  const recordPromises = event.Records.map(async (record, index) => {
    if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
      const newImage = record.dynamodb?.NewImage;
      const taskId = newImage?.pk.S;
      const taskStatus = newImage?.status.S;
      const userEmail = newImage?.user_email.S;

      const message = `Task ${taskId} status has changed to ${taskStatus}`;
      const params = {
        Message: message,
        Subject: `Task ${taskId} Status Update`,
        TopicArn: process.env.SNS_TOPIC_ARN,
      };

      await publish("", JSON.stringify(params));
    }

    return;
  });

  return Promise.allSettled(recordPromises);
}
