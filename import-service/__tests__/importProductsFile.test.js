const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const mod = require('../handler.ts');
const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'importProductsFile' });

describe('importProductsFile: positive', () => {
  const signedUrl = 'http://test.com';
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    AWSMock.restore('S3');
    done();
  });

  it('should return signed URL', async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('S3', 'getSignedUrl', (_, __,callback) => {
      console.log('S3', 'getSignedUrl', 'mock called');
      callback(null, signedUrl);
    })
     const response = await wrapped.run({queryStringParameters: 'file.csv'});
     console.log(response);
    expect(response.body).toBe(signedUrl);
  });
});
