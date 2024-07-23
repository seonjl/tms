import {
  PublishCommand,
  SNSClient,
  SubscribeCommand,
} from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
});

export const publish = async (topicArn: string, message: string) => {
  const response = await snsClient.send(
    new PublishCommand({
      Message: message,
      TopicArn: topicArn,
    })
  );

  return response;
};

export const subscribe = async ({
  Protocol,
  TopicArn,
  Endpoint,
}: {
  TopicArn: string;
  Protocol: string;
  Endpoint: string;
}) => {
  const response = await snsClient.send(
    new SubscribeCommand({
      Protocol: Protocol,
      TopicArn: TopicArn,
      Endpoint: Endpoint,
    })
  );

  return response;
};
