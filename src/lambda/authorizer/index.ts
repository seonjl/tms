import middy from "@middy/core";

// const eventSchema = {
//   type: "object",
//   properties: {
//     headers: {
//       type: "object",
//       properties: {
//         authorization: { type: "string" },
//       },
//     },
//   },
// } as const;

export async function lambdaHandler() {
  return {
    isAuthorized: true,
    context: {
      email: "seonjl.dev@gmail.com",
    },
  };
}

export const handler = middy().handler(lambdaHandler);
