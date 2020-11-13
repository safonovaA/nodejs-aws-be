import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import 'source-map-support/register';
import { CORS_HEADERS } from '../constants/headers';
import { DB_OPTIONS } from '../constants/db-options';
import { handleError } from './error-handlers';

export const getProducts: APIGatewayProxyHandler = async (event, _context) => {
  console.log('Get Products: API Gateway proxy event', event);
  const client = new Client(DB_OPTIONS);
  try {
    await client.connect();
    const comics = await client.query(`
      select p.*, s.count from products p 
      left join stocks s on s.product_id = p.id
    `);
    console.log('Get Products: found comics', comics);

    return {
      headers: {
        ...CORS_HEADERS,
      },
      statusCode: 200,
      body: JSON.stringify(comics.rows),
    };
  } catch (err) {
    console.log('Get Products: unexpected error', err);
    return handleError(err);
  } finally {
    client.end();
  }
}
