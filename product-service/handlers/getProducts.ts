import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { CORS_HEADERS } from '../constants/headers';
const comics = require('../mocks/comics.json');

export const getProducts: APIGatewayProxyHandler = async (event, _context) => {
  console.log('Get Products: API Gateway proxy event', event);
  return {
    headers: {
      ...CORS_HEADERS,
    },
    statusCode: 200,
    body: JSON.stringify(comics),
  };
}
