const mod = require('../handler.ts');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'getProducts' });
const mockdata = require('../mocks/comics.json');

describe('getProducts: positive', () => {
  beforeAll((done) => {
    done();
  });

  it('should return list of products', async () => {
    const response = await wrapped.run({});
    expect(response.body).toBe(JSON.stringify(mockdata));
  });
});
