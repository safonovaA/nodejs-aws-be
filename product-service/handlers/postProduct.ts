import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import 'source-map-support/register';
import { CORS_HEADERS } from '../constants/headers';
import { DB_OPTIONS } from '../constants/db-options';
import { handleError } from './error-handlers';
import { Product } from '../constants/product';

export const postProduct: APIGatewayProxyHandler = async (event, _context) => {
  console.log('Post Product: API Gateway proxy event', event);
  const client = new Client(DB_OPTIONS);
  const payload: Product = JSON.parse(event.body);
  console.log('Post Product: payload', payload);

  try {
    await client.connect();
    await client.query('BEGIN');

    const {
      title, description, price,
      author, published, img,
      count,
    } = payload;
    const isValid = validateRequiredFieldsPayload(payload);

    if (!isValid) {
      return handleBadRequest();
    }

    const insertProductQuery = `insert into products (title, description, price, author, published, img)
    values($1, $2, $3, $4, $5, $6) returning id`;
    const values = [title, description, Number(price), author, published, img];

    const { rows: [{id: bookId}] } = await client.query(insertProductQuery, values);
    console.log('Post Product: created id', bookId);

    const insertStocks = `insert into stocks (product_id, count)
    values($1,$2)`;
    await client.query(insertStocks, [bookId, Number(count)]);
    await client.query('COMMIT');

    return {
      headers: {
        ...CORS_HEADERS,
      },
      statusCode: 201,
      body: JSON.stringify(`Product with id ${bookId} was created!`),
    };
  } catch (err) {
    console.log('Get Products: unexpected error', err);
    await client.query('ROLLBACK');

    return handleError(err);
  } finally {
    client.end();
  }
}

function validateRequiredFieldsPayload(payload: Product) {
  const {
    title, price,
    author, published,
    count,
  } = payload;

  return title && price && author && published && count;
}

function handleBadRequest() {
  return {
    headers: {
      ...CORS_HEADERS,
    },
    statusCode: 400,
    body: JSON.stringify(`Payload to create product in invalid!`),
  };
}