import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import 'source-map-support/register';
import { DB_OPTIONS } from '../constants/db-options';
import { CORS_HEADERS } from '../constants/headers';
import { handleError } from './error-handlers';

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  console.log('Get products by Id: event pathParameters', event.pathParameters);
  const client = new Client(DB_OPTIONS);

  try {
    await client.connect();
    const { id } = event.pathParameters;
    const item = await findBookById(client, id);

    if (item) {
      return {
        headers: {
          ...CORS_HEADERS,
        },
        statusCode: 200,
        body: JSON.stringify(item),
      };
    } else {
      console.log('Get Product by id: product was not found');

      return handleNotFound(id);
    }
  } catch (err) {
    console.log('Get Product by id: unexpected error', err);

    return handleError(err);
  } finally {
    client.end();
  }
}

async function findBookById(client, id) {
  const query = {
    text: `select p.*, s.count from products p 
    left join stocks s on p.id = s.product_id 
    where p.id = $1`,
    values: [id],
  }
  console.log('Product id:',id);

  const item = await client.query(query.text, query.values);
  console.log('Found product:', item);

  return item.rows.length && item.rows[0];
}

function handleNotFound(id: string) {
  return {
    headers: {
      ...CORS_HEADERS,
    },
    statusCode: 404,
    body: `Comics books with id:${id} was not found!`,
  }
}