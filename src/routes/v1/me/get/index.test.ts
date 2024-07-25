import { jsonSafeParse } from "@middy/util";
import { handler } from "./index.js"; // ESM

describe("lambdaHandler", () => {
  test("should get the myinfo", async () => {
    const mockEvent = {
      httpMethod: "GET",
      path: "/v1/me",
      headers: {
        "Content-Type": "application/json",
        authorization: "JS1A1.c1frPZS5or2gDiHJl9lQ_",
      },
      requestContext: {
        authorizer: {
          lambda: {
            email: "seonjl.dev@gmail.com",
          },
        },
      },
    };

    const context = {};

    const response = await handler(mockEvent as any, context as any);
    const result = jsonSafeParse(response.body);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    console.log("📢 result");
    console.log(result);
  });
});
