import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const redirect_uri =
  "https://zofg6ai9t8.execute-api.ap-northeast-2.amazonaws.com/internal/callback/kakao";

export async function lambdaHandler(event: any, context: any) {
  const { code } = event.queryStringParameters;

  const res = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "f3755636b6841aee7e292f8f1c469c8f",
      redirect_uri: redirect_uri,
      code,
      client_secret: "Ylkg3yDIinAzesZiXGUgVm8aGF1lopQh",
    }),
  });

  const result = await res.json();

  if (result.error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ...result }),
    };
  }

  const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${result.access_token}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });

  const user = await userRes.json();

  return {
    statusCode: 302,
    headers: {
      Location:
        "https://my-react-project-nine.vercel.app/callback/kakao?access_token=" +
        result.access_token,
    },
    body: JSON.stringify({ ...user }),
  };
}

export const handler = middy().use(httpErrorHandler()).handler(lambdaHandler);
