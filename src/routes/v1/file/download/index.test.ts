import { jsonSafeParse } from "@middy/util";
import axios from "axios";
import fs from "fs";
import { handler } from "./index.js"; // ESM

describe("lambdaHandler", () => {
  let url: string;
  test("should create a url for download", async () => {
    const mockEvent = {
      httpMethod: "POST",
      path: "/v1/files/download",
      body: JSON.stringify({
        file_id: "file.28zibzc7sxk",
        name: "my.md",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      requestContext: {
        authorizer: {
          lambda: {
            email: "Chanelle.Fadel@gmail.com",
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
