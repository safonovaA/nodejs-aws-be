const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const mod = require('../handler.ts');
const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'catalogBatchProcess' });
const mock = require('../mocks/comics.json');

describe('catalogBatchProcess.test: positive', () => {
  const product = mock[0];
  const event = {
    Records: [{body: JSON.stringify(product)}],
  };
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    AWSMock.restore('SNS');
    done();
  });

  it('should publish message to SNS', async () => {
    AWSMock.setSDKInstance(AWS);
    const publishMock = jest.fn((params) => {});
    AWSMock.mock('SNS', 'publish', (params, callback) => {
      console.log('SNS', 'publish', 'mock called');
      callback(null, publishMock(params));
    });
    const response = await wrapped.run(event);
    expect(publishMock).toHaveBeenCalled();
  });
});
