import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { BUCKET } from '../constants/bucket';
import { CORS_HEADERS } from '../constants/headers';
import { S3 } from 'aws-sdk';

export const importProductsFile: APIGatewayProxyHandler = async (event, _context) => {
  console.log('Import product file: API Gateway proxy event', event);
  const fileName = event.queryStringParameters.name;
  const params = {
    Bucket: BUCKET,
    Key: `uploaded/${fileName}`,
    ContentType: 'text/csv',
    Expires: 60
  };
  try {
    const s3 = new S3({region: 'eu-west-1'});
    const signedURL = await s3.getSignedUrlPromise('putObject', params);
    return {
      headers: {
        ...CORS_HEADERS,
      },
      statusCode: 200,
      body: JSON.stringify(signedURL),
    };
  } catch (err) {
    console.log('Import product file: unexpected error', err);
    return {
      headers: {
        ...CORS_HEADERS,
      },
      statusCode: 500,
      body: err,
    }
  }
}
