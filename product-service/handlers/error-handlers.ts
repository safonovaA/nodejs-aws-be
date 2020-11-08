import { CORS_HEADERS } from "../constants/headers";

 export function handleError(err) {
  return {
    headers: {
      ...CORS_HEADERS,
    },
    statusCode: 500,
    body: err,
  }
}