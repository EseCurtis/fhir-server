import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import OAuthClient, { OAuthConfig } from '@/classes/FHIR/OAuthClient';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Default port is 3000 if PORT environment variable is not set

app.get('/', (req: Request, res: Response) => {
  // Example usage:
  // Create an instance of the OAuthClient class with appropriate configuration
  const config: OAuthConfig = {
    clientId: '04974aca-a8dd-449f-905e-8a64c75b8724',
    tokenEndpoint: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    privateKeyPath: './src/keys2/privatekey.pem',
    publicKeyPath: './src/keys2/publickey509.pem',
    jwtAlgorithm: 'RS384',
  };

  const oauthClient = new OAuthClient(config);

  oauthClient.getAccessToken()
    .then(token => {
      console.log('Access token:', token);
      res.send('Express + TypeScript Server');
    })
    .catch(error => {
      console.error('Error:', error);
      res.send('ERROR OH');
    });

});

app.get('/.well-known/jwks.json', (req, res) => {
  const jwk = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/keys2/public.jwk'), 'utf8'));
  res.json({ keys: [jwk] });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
