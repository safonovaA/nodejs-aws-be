import { Client } from 'pg';
import 'source-map-support/register';
import { DB_OPTIONS } from '../constants/db-options';
import { SNS } from 'aws-sdk';
import { validateRequiredFieldsPayload } from './validators';
import { SQSHandler } from 'aws-lambda';

export const catalogBatchProcess: SQSHandler = async (event, _context) => {
  console.log('Event', event);
  const client = new Client(DB_OPTIONS);
  const sns = new SNS({region: 'eu-west-1'});
  const products = event.Records.map(({ body }) => JSON.parse(body));
  const validValues = products.filter((product) => validateRequiredFieldsPayload(product))
  console.log(`Received ${products.length} product/s`, products);

  try {
    await client.connect();
    await client.query('BEGIN');
    console.log(validValues);
    await Promise.all(validValues.map(async (product) => {
      const {
        title, description, price,
        author, published, img,
        count,
      } = product;
      const insertProductQuery = `insert into products (title, description, price, author, published, img)
      values($1, $2, $3, $4, $5, $6) returning id`;
      const values = [title, description, Number(price), author, published, img];

      const { rows: [{ id: bookId }] } = await client.query(insertProductQuery, values);
      console.log('Created id', bookId);

      const insertStocks = `insert into stocks (product_id, count)
      values($1,$2)`;
      await client.query(insertStocks, [bookId, Number(count)]);
    }));

    await client.query('COMMIT');
  } catch (err) {
    console.log('Unexpected error', err);
    await client.query('ROLLBACK');
  } finally {
    client.end();
  }
  const message = `The following titles were added: ${validValues.map((p) => p.title).join(', ')}`;
  await sns.publish({
    Subject: 'New products were uploaded!',
    Message: message,
    TopicArn: process.env.SNS_TOPIC_ARN,
    MessageAttributes: {count: {
      DataType: "Number",
      StringValue: validValues.length.toString(),
    }},
  }).promise();
}
