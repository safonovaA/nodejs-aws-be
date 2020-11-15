const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const mod = require('../handler.ts');
const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'importFileParser' });

describe('importFileParser: positive', () => {
  const record = {
    s3: { object: { key: 'uploaded/file.csv'}},
  };
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    AWSMock.restore('S3');
    done();
  });

  it('should move file from uploaded to parsed', async () => {
    AWSMock.setSDKInstance(AWS);
    const copyObjectMock = jest.fn((params) => {});
    const deleteObjectMock = jest.fn(() => {});
    AWSMock.mock('S3', 'getObject', (_, callback) => {
      console.log('S3', 'getObject', 'mock called');
      callback(null, {});
    })
    AWSMock.mock('S3', 'copyObject', (params, callback) => {
      console.log('S3', 'copyObject', 'mock called');
      callback(null, copyObjectMock(params));
    });
    AWSMock.mock('S3', 'deleteObject', (_, callback) => {
      console.log('S3', 'deleteObject', 'mock called');
      callback(null, deleteObjectMock());
    })
    const response = await wrapped.run({Records: [record]});
    expect(copyObjectMock).toHaveBeenCalled();
    expect(deleteObjectMock).toHaveBeenCalled();
    expect(copyObjectMock).toHaveBeenCalledWith({
      "Bucket": "sa-product-bucket",
      "CopySource": "sa-product-bucket/uploaded/file.csv",
      "Key": "parsed/file.csv",
    });
  });
});
