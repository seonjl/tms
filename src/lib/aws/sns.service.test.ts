import { publish, subscribe } from "./sns.service";

describe("subscribe", () => {
  test("publish", async () => {
    const result = await publish({
      Message: "Hello, World!",
      TopicArn:
        "arn:aws:sns:ap-northeast-2:905418160644:task-changed-notification-topic",
      // TargetArn:
      //   "arn:aws:sns:ap-northeast-2:905418160644:task-changed-notification-topic",
    });

    console.log("📢 result");
    console.log(result);
  });
  test("subscribe", async () => {
    const result = await subscribe({
      Protocol: "email",
      TopicArn:
        "arn:aws:sns:ap-northeast-2:905418160644:task-changed-notification-topic",
      Endpoint: "roy@reconlabs.ai",
    });

    console.log("📢 result");
    console.log(result);
  });
});
