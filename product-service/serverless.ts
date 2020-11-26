import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    jest: {
      jestConfig: './jest.config.js',
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-jest-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: process.env.PG_HOST,
      PG_PORT: process.env.PG_PORT,
      PG_DATABASE: process.env.PG_DATABASE,
      PG_USERNAME: process.env.PG_USERNAME,
      PG_PASSWORD: process.env.PG_PASSWORD,
      SNS_TOPIC_ARN: {Ref: 'SNSTopic'},
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: '${cf:import-service-${self:provider.stage}.SQSQueueArn}',
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: { Ref: 'SNSTopic'},
      },
    ]
  },
  functions: {
    getProducts: {
      handler: 'handler.getProducts',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true,
          }
        }
      ]
    },
    getProductById : {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{id}',
            cors: true,
            request: {
              parameters: {
                paths: {
                  id: true,
                }
              }
            }
          }
        }
      ]
    },
    postProduct: {
      handler: 'handler.postProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true,
          }
        }
      ]
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: '${cf:import-service-${self:provider.stage}.SQSQueueArn}'
          }
        }
      ],
    }
  },
  resources: {
    Resources: {
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'create-product-topic'
        }
      },
      SNSSubscriptionNotEmptyUpload: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'aws.node.sa@gmail.com',
          Protocol: 'email',
          TopicArn: { Ref: 'SNSTopic' },
          FilterPolicy: '{"count": [{"numeric": [">", 0]}]}',
        }
      },
      SNSSubscriptionEmpty: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'aasafonova@bk.ru',
          Protocol: 'email',
          TopicArn: { Ref: 'SNSTopic' },
          FilterPolicy: '{"count": [{"numeric": ["=", 0]}]}',
        }
      },
    }
  }
}

module.exports = serverlessConfiguration;
