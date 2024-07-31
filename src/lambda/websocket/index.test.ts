describe("lambdaHandler", () => {});

import { randomUUID } from "crypto";
import WebSocket from "isomorphic-ws";
import { defaultHandler } from "./index";

async function setupWebSocket() {
  const wsUrl =
    "wss://1bcv3s9keh.execute-api.ap-northeast-2.amazonaws.com/production";
  const ows = new WebSocket(wsUrl);

  return await new Promise<WebSocket>((resolve) => {
    ows.onopen = () => {
      resolve(ows);
    };
    ows.onmessage = (event: any) => {};

    ows.onerror = (error) => {};

    ows.onclose = () => {};
  });
}

describe("websocket", () => {
  let ws1: WebSocket;
  let ws2: WebSocket;

  beforeAll(async () => {
    ws1 = await setupWebSocket();
    ws2 = await setupWebSocket();
  });

  test("should connect to WebSocket", () => {
    expect(ws1.readyState).toBe(WebSocket.OPEN);
    expect(ws2.readyState).toBe(WebSocket.OPEN);
  });

  test("should receive message from WebSocket", (done) => {
    const mockEvent = {
      body: JSON.stringify({
        hello: "world",
      }),
      requestContext: {
        domainName: "1bcv3s9keh.execute-api.ap-northeast-2.amazonaws.com",
        connectionId: randomUUID(),
        stage: "production",
      },
    };

    defaultHandler(mockEvent as any);

    ws2.onmessage = (event: any) => {
      console.log(`Received: ${event.data}`);
      done();
    };
  });

  test("should disconnect from WebSocket", async () => {
    ws1.onopen = () => {
      console.log("WebSocket is open now.");
    };

    ws1.close();
  });

  afterAll(() => {
    ws1.close();
    ws2.close();
  });
});
