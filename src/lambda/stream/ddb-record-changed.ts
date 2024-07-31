import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { DynamoDBStreamEvent } from "aws-lambda";
import { publish } from "../../lib/aws/sns.service.js";
import { TaskRecord } from "../../lib/ddb/task.repository.js";

const topicArn =
  "arn:aws:sns:ap-northeast-2:905418160644:task-changed-notification-topic";
// {
//   Records: [
//     {
//       eventID: 'ca821c0a683fca30d570fc6e320af2ef',
//       eventName: 'INSERT',
//       eventVersion: '1.1',
//       eventSource: 'aws:dynamodb',
//       awsRegion: 'ap-northeast-2',
//       dynamodb: [{
//         ApproximateCreationDateTime: 1722402388,
//         Keys: {
//           sk: { S: '2024-07-31T04:58:41.318Z' },
//           pk: { S: 'seonjl.dev@gmail.com' }
//         },
//         NewImage: {
//           last_logged_in_at: { S: '2024-07-31T05:06:28.172Z' },
//           entity_type: { S: 'user' },
//           updated_at: { S: '2024-07-31T05:06:28.221Z' },
//           provider: { S: 'google' },
//           sk: { S: '2024-07-31T04:58:41.318Z' },
//           created_at: { S: '2024-07-31T05:06:28.221Z' },
//           pk: { S: 'seonjl.dev@gmail.com' }
//         },
//         SequenceNumber: '300000000017052762000',
//         SizeBytes: 234,
//         StreamViewType: 'NEW_IMAGE'
//       }],
//       eventSourceARN: 'arn:aws:dynamodb:ap-northeast-2:905418160644:table/TMSSystemTable/stream/2024-07-31T04:45:27.128'
//     }
//   ]
// }
export async function handler(event: DynamoDBStreamEvent) {
  const recordPromises = event.Records.map(async (record, index) => {
    if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
      if (!record.dynamodb?.NewImage) {
        return;
      }

      const newImage = unmarshall(record.dynamodb.NewImage as any);

      if (!newImage) {
        return;
      }

      if (newImage.entity_type === "task") {
        const task = newImage as TaskRecord;

        const message = {
          user_email: task.pk,
          task_id: task.sk,
          related_users: task.related_users,
        };
        console.log("📢 message");
        console.log(message);
        const response = await publish({
          TopicArn: topicArn,
          Message: JSON.stringify(message),
        });
        console.log("📢 response");
        console.log(response);
      }
    }
  });

  return Promise.allSettled(recordPromises);
}
