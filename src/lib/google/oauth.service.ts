import axios from "axios";
import { createJsonError } from "../util/index.js";
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("📢 error.response in oauth.service.ts");
    console.log(error.response);
    return Promise.reject(
      createJsonError({
        message:
          error?.response?.data?.error_description || "internal_server_error",
        code: error?.response?.data?.error || "internal_server_error",
        statusCode: error?.response?.status || 500,
      })
    );
  }
);

// 승인 코드를 갱신 토큰 및 액세스 토큰으로 교환
export async function authorizeByGoogle({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}) {
  const responseGenerateToken = await axios.post(
    `https://oauth2.googleapis.com/token`,
    {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      access_type: "online",
    },
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const { access_token, expires_in, token_type, scope, refresh_token } =
    responseGenerateToken.data;

  console.log("📢 refresh_token");
  console.log(refresh_token);
  return { access_token, expires_in, token_type, scope, refresh_token };
}

// 사용자 정보 조회
export async function getUserInfoByGoogle(access_token: string) {
  const responseGetTokenInfo = await axios.get(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${access_token}`
  );

  const { email } = responseGetTokenInfo.data;

  return { email };
}

// 액세스 토큰 갱신
export async function refreshTokenByGoogle(refreshToken: string) {
  const responseRefreshToken = await axios.post(
    `https://oauth2.googleapis.com/token`,
    {
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    },
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const { access_token, expires_in, token_type, scope } =
    responseRefreshToken.data;

  return { access_token, expires_in, token_type, scope };
}

// 토큰 취소
export async function revokeTokenByGoogle(token: string) {
  await axios.post(`https://oauth2.googleapis.com/revoke?token=${token}`);
}
