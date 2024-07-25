import { handler } from "./index.js";

describe("lambdaHandler", () => {
  test("authorizer", async () => {
    const mockEvent = {
      httpMethod: "POST",
      path: "/v1/auth/google/authorize",
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer ya29.a0AXooCgsYrtsuc-K-bT01HDqalV3T9m99mjul1yUFOEXKfTcxT7IS0lg7ArvXc9Ya89bOlXTGC1c5CQMlOqOLC7dYNcgqSvr5yUrXmsI_pIQnVRqhmyKkkKY7UzQrTPnhIShz1VB5wyuNrbZjmriEqPXilfBV0h2gablVaCgYKAQASARISFQHGX2MikXWalIw0ZJRNV8Gg3gLfug0171",
      },
    };

    const context = {};

    const response = await handler(mockEvent as any, context as any);

    console.log("📢 result");
    console.log(response.data);
  });
});
