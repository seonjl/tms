import { faker } from "@faker-js/faker";
import { jsonSafeParse } from "@middy/util";
import { handler } from "./index.js"; // ESM

describe("lambdaHandler", () => {
  test("should create a new task", async () => {
    const mockEvent = {
      httpMethod: "POST",
      path: "/v1/tasks",
      body: JSON.stringify({
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
      }),
      headers: {
        "Content-Type": "application/json",
        authorization: "JS1A1.c1frPZS5or2gDiHJl9lQ_",
      },
      requestContext: {
        authorizer: {
          lambda: {
            email: "seonjl.dev@gmail.com",
            // email: faker.internet.email(),
          },
        },
      },
    };

    const context = {};

    const response = await handler(mockEvent as any, context as any);
    const result = jsonSafeParse(response.body);

    expect(response.statusCode).toBe(201);
    expect(response.body).toBeDefined();

    console.log("📢 result");
    console.log(result);
  });
});
