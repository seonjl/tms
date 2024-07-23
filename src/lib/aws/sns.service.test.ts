import { subscribe } from "./sns.service";

describe("subscribe", () => {
  test("subscribe", async () => {
    const result = await subscribe({
      Protocol: "email",
      TopicArn:
        "arn:aws:sns:ap-northeast-2:905418160644:task-notification-topic",
      Endpoint: "roy@reconlabs.ai",
    });

    console.log("📢 result");
    console.log(result);
  });
});
