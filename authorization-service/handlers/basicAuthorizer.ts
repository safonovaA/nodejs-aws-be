import { APIGatewayRequestAuthorizerEvent, APIGatewayRequestAuthorizerHandler, AuthResponse } from 'aws-lambda';
import 'source-map-support/register';

export const basicAuthorizer: APIGatewayRequestAuthorizerHandler=  (event: APIGatewayRequestAuthorizerEvent, _context, cb) => {
  console.log('API Gateway authorizer event', event);
  if (event.type !== 'REQUEST') {
    cb('Unauthorized');
  }
  try {
    const { Authorization: authorizationToken } = event.headers;
    const [, encodedCreds] = authorizationToken.split(' ');
    const credsBuff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = credsBuff.toString('utf-8').split(':');
    const [username, password] = plainCreds;

    console.log(`username: ${username} password: ${password}`);

    const storedPassword = process.env[username];
    const effect = !storedPassword || storedPassword !== password ? 'Deny' : 'Allow';
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);
    cb(null, policy);
  } catch (err) {
    cb(`Unauthorized: ${err.message}`);
  }
}

function generatePolicy(principalId, resource, effect = 'Allow'): AuthResponse {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ]
    }
  }
}