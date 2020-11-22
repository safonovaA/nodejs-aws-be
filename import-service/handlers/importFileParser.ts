import { S3Event, S3Handler } from 'aws-lambda';
import 'source-map-support/register';
import { BUCKET } from '../constants/bucket';
import { S3, SQS } from 'aws-sdk';
const csv = require('csv-parser')

export const importFileParser: S3Handler = async (event: S3Event, _context) => {
  console.log('Import file parser: API Gateway proxy event', event);
  try {
    const s3 = new S3({ region: 'eu-west-1' });
    const sqs = new SQS();
    const { Records } = event;
    await Promise.all(Records.map(async (record) => {
      console.log('Import file parser: s3 record', record.s3);
      const { s3: { object: { key } } } = record;
      const params = {
        Bucket: BUCKET,
        Key: key,
      };
      const s3Stream = s3.getObject(params).createReadStream();

      return new Promise((resolve, reject) => {
        s3Stream
          .pipe(csv())
          .on('data', async (data) => {
            console.log('Import file parser: parsed data ', data);
            await sqs.sendMessage({
              QueueUrl: process.env.SQS_URL,
              MessageBody: JSON.stringify(data),
            }).promise();
            console.log('Import file parser: SQS message is sent');
          })
          .on('error', (err) => {
            console.log(err);
            reject(err);
          })
          .on('end', async () => {
            console.log(`Import file parser: record object key ${key}`);
            const destinationKey: string = key.replace('uploaded', 'parsed');;
            await s3
              .copyObject({
                ...params,
                Key: destinationKey,
                CopySource: `${BUCKET}/${params.Key}`,
              })
              .promise();
            console.log(`Import file parser: copied to ${destinationKey} `);
            await s3.deleteObject(params).promise();
            console.log(`Import file parser: ${key} deleted`);
            resolve();
          });
      })
    }));
  } catch (err) {
    console.log(err);
  }


}
