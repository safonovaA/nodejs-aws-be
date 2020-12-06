import type { Serverless } from 'serverless/aws';
import { BUCKET } from './constants/bucket';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
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
  plugins: ['serverless-webpack', 'serverless-jest-plugin', 'serverless-pseudo-parameters'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL: {
        Ref: 'SQSQueue'
      }
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: 'arn:aws:s3:::sa-product-bucket',
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: 'arn:aws:s3:::sa-product-bucket/*',
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: '${cf:import-service-${self:provider.stage}.SQSQueueArn}',
      }
    ]
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            authorizer: {
              name: 'requestAuthorizer',
              arn: 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:authorization-service-dev-basicAuthorizer',
              resultTtlInSeconds: 0,
              identitySource: 'method.request.header.Authorization',
              type: 'request',
            },
            request: {
              parameters: {
                querystrings: {
                  name: true,
                }
              }
            }
          }
        }
      ]
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: BUCKET,
            event: 's3:ObjectCreated:*',
            rules: [{prefix: 'uploaded/', suffix: '.csv'}],
            existing: true,
          }
        }
      ]
    },
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'parsed-products-queue'
        }
      },
      UnauthorizedResponse: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
          },
          ResponseType: 'UNAUTHORIZED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          },
          StatusCode: '401',
        }
      },
      AccessDeniedResponse: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
          },
          ResponseType: 'ACCESS_DENIED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          },
          StatusCode: '403',
        }
      }
    },
    Outputs: {
        SQSQueueUrl: {
          Value: { Ref: 'SQSQueue' },
        },
        SQSQueueArn: {
          Value: { "Fn::GetAtt": [ 'SQSQueue', 'Arn' ]}
        }
      },
  },
}

module.exports = serverlessConfiguration;
