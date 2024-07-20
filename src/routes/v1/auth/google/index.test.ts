import { jsonSafeParse } from "@middy/util";
import { handler as authorizeHandelr } from "./authorize.js";
import { handler as refreshHandler } from "./refresh.js";
import { handler as revokeHandler } from "./revoke.js";

const ACCESS_TOKEN =
  "ya29.a0AXooCgs0mF7TpRt8W4KkmayI3e1mCii_J8YSBIGo1vZd4nowha8WdRx2USpHOgiEycApUNLA6LwZX6ErxslPrBbjZLajaOkf2bwFg3_-0X7d5CNhHXoxOs0jiW3Swvfn3ACRyjZ4gR1VsqR0LQXoemJbkjBD3gZLSol1aCgYKAfQSARISFQHGX2MibBTKuiY7edVWY_f1IGPNBA0171";
const A2 =
  "ya29.a0AXooCgsIdG7ZQBdrypq29Dz2Fd_NYJgY_gjUPrxmBTF5akPNE9op-PTLGNmB9hjkBpsoPj-CT3GNGGSNJ2boKfK0i7qVHINf0FkMdjpYUFopVVEPkJDT0SrR7XVlTHwpXukprnjo0PFI_T44KrV__sBAP-xZiLvsSg6RaCgYKAaASARISFQHGX2MicwEWGBIL8o4Bwgb6eTMy_g0171";
const REFRESH_TOKEN =
  "1//04MtMEfD1X5GLCgYIARAAGAQSNwF-L9IrjBGv69yD7hYihZvJ4lr0W6KGbgq_sl0a3F7NHpLKxLnJQsyXREGE1pGt9TyPN8J8Q8E";
describe("lambdaHandler", () => {
  test("authorizeByGoogle", async () => {
    const mockEvent = {
      httpMethod: "POST",
      path: "/v1/auth/google/authorize",
      body: JSON.stringify({
        code: "4/0ATx3LY4BxccaZ28SGcjwMW8TsPzfiM6okkX4WpFSLirPUnbvJlw1rvPdMF1XA5AO0tTbHQ",
        locale: "ko",
      }),
      headers: {
        "Content-Type": "application/json",
        authorization: "JS1A1.c1frPZS5or2gDiHJl9lQ_",
        origin: "http://localhost:3000",
      },
    };

    const context = {};

    const response = await authorizeHandelr(mockEvent as any, context as any);
    const result = jsonSafeParse(response.body);

    console.log("📢 result");
    console.log(result);
  });

  test("refreshHandler", async () => {
    const mockEvent = {
      httpMethod: "POST",
      path: "/v1/auth/google/refresh",
      body: JSON.stringify({
        token: A2,
      }),
      headers: {
        "Content-Type": "application/json",
        authorization: "JS1A1.c1frPZS5or2gDiHJl9lQ_",
      },
    };

    const context = {};

    const response = await refreshHandler(mockEvent as any, context as any);
    const result = jsonSafeParse(response.body);

    console.log("📢 result");
    console.log(result);
  });

  test("revokeHandler", async () => {
    const mockEvent = {
      httpMethod: "POST",
      path: "/v1/auth/google/revoke",
      body: JSON.stringify({
        token: A2,
      }),
      headers: {
        "Content-Type": "application/json",
        authorization: "JS1A1.c1frPZS5or2gDiHJl9lQ_",
      },
    };

    const context = {
      userId: "test@reconlabs.ai",
    };

    const response = await revokeHandler(mockEvent as any, context as any);
    const result = jsonSafeParse(response.body);

    console.log("📢 result");
    console.log(result);
  });
});
