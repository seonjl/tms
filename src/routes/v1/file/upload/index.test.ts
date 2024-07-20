import { faker } from "@faker-js/faker";
import { jsonSafeParse } from "@middy/util";
import axios from "axios";
import fs from "fs";
import { handler } from "./index.js"; // ESM

describe("lambdaHandler", () => {
  let url: string;
  test("should create a url for upload", async () => {
    const mockEvent = {
      httpMethod: "POST",
      path: "/v1/files/upload",
      body: JSON.stringify({
        name: "readme.md",
        metadata: {
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      requestContext: {
        authorizer: {
          lambda: {
            email: faker.internet.email(),
          },
        },
      },
    };

    const context = {};

    const response = await handler(mockEvent as any, context as any);
    const result = jsonSafeParse(response.body);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    url = result.url;
    console.log("📢 result");
    console.log(result);
  });

  it("should upload a file to the presigned url", async () => {
    const file = fs.readFileSync("readme.md");

    await axios
      .put(url, file, {
        headers: {},
      })
      .then((response) => {
        expect(response.status).toBe(200);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  }, 20000);
});
