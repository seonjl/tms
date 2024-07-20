import { authorizeByGoogle } from "./oauth.service";

describe("authorizeByGoogle", () => {
  test("authorizeByGoogle", async () => {
    const result = await authorizeByGoogle({
      code: "4/0ATx3LY7bF1XsSbgrFRSZALiWLCgouxXb94XWsnCkvSsV7IKMOuqYmOSy2KQqnUel3JsdeA",
      redirectUri: "https://developers.google.com/oauthplayground",
    });

    console.log("📢 result");
    console.log(result);
  });
});
