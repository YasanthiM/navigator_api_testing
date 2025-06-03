import axios from 'axios';
import { config } from './aws-config';

export async function loginWithCognito(): Promise<string> {
  const payload = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: config.USERNAME,
      PASSWORD: config.PASSWORD
    },
    ClientId: config.COGNITO_CLIENT_ID
  };

  const headers = {
    'Content-Type': 'application/x-amz-json-1.1',
    'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
  };

  const response = await axios.post(config.BASE_URL_3, payload, { headers });
  const idToken = response.data.AuthenticationResult.IdToken;

  return idToken;
}
