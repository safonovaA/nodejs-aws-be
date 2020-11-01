import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { CORS_HEADERS } from '../constants/headers';
import * as comics from '../mocks/comics.json';

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  console.log('Get by Id event pathParameters', event.pathParameters);
  const { id } = event.pathParameters;
  try {
    const item = findBookById(id);
    if (item) {
      return {
        headers: {
          ...CORS_HEADERS,
        },
        statusCode: 200,
        body: JSON.stringify(item),
      };
    } else {
      handleNotFound(id);
    }
  } catch (err) {
    handleError(err);
  }
}

function findBookById(id) {
  return comics.default.find((book) => { return book.id == id});
}

function handleError(err) {
  return {
    headers: {
      ...CORS_HEADERS,
    },
    statusCode: 500,
    body: err,
  }
}

function handleNotFound(id: string) {
  return {
    headers: {
      ...CORS_HEADERS,
    },
    statusCode: 404,
    body: `Comics books with ${id} was not found!`,
  }
}