import { CORS_HEADERS } from "../constants/headers";

 export function handleError(err) {
  return {
    headers: {
      ...CORS_HEADERS,
    },
    statusCode: 500,
    body: JSON.stringify(err),
  }
}

export function handleBadRequest() {
  return {
    headers: {
      ...CORS_HEADERS,
    },
    statusCode: 400,
    body: JSON.stringify(`Payload to create product in invalid!`),
  };
}
