const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'getProductById' });
const mockdata = require('../mocks/comics.json');

describe('getProductById: positive', () => {
  beforeAll((done) => {
    done();
  });

  it('it should return item',  async() => {
    const response = await wrapped.run({pathParameters: {id: "1"}});
    expect(response.body).toBe(JSON.stringify(mockdata[0]));
  });
});

describe('getProductById: negative', () => {
  beforeAll((done) => {
    done();
  });

  it('it should return 404 on not existed resource', async () => {
    const response = await wrapped.run({pathParameters: {id: "5"}});
    expect(response.statusCode).toBe(404);
  });

  it('it should return 500 on internal server error', async () => {
    const response = await wrapped.run({});
    expect(response.statusCode).toBe(500);
  });
});
