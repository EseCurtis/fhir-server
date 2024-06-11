import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import {v4} from "uuid";

export interface OAuthConfig {
  clientId: string;
  tokenEndpoint: string;
  privateKeyPath: string;
  publicKeyPath: string;
  jwtAlgorithm: jwt.Algorithm;
}

class OAuthClient {
  private clientId: string;
  private tokenEndpoint: string;
  private privateKey: string;
  private publicKey: string;
  private jwtAlgorithm: jwt.Algorithm;

  constructor(config: OAuthConfig) {
    this.clientId = config.clientId;
    this.tokenEndpoint = config.tokenEndpoint;
    this.privateKey = fs.readFileSync(path.resolve(config.privateKeyPath), 'utf8');
    this.publicKey = fs.readFileSync(path.resolve(config.publicKeyPath), 'utf8');
    this.jwtAlgorithm = config.jwtAlgorithm;
  }

  private generateJWT(): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 300; // Ensure the exp is no more than 5 minutes in the future
    const payload = {
      iss: this.clientId,
      sub: this.clientId,
      aud: this.tokenEndpoint,
      jti: this.generateJTI(),
      exp: exp,
      nbf: now,
      iat: now
    };
  
    const headers = {
      alg: this.jwtAlgorithm,
      typ: "JWT",
      kid: "myapp", // Replace with your key ID
      // jku: "https://fhir-server.vercel.app/.well-known/jwks.json" // Replace with your JWK Set URL if applicable
    };
  
    return jwt.sign(payload, this.privateKey, { header: headers });
  }
  

  private generateJTI(): string {
    return v4();
    const jti = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return jti.length > 151 ? jti.substring(0, 151) : jti; // Ensure the jti is no longer than 151 characters
  }

  public async getAccessToken(): Promise<string> {
    const jwtToken = this.generateJWT();

    console.log(jwtToken);
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    params.append('client_assertion', jwtToken);

    try {
      const response = await axios.post(this.tokenEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = response.data;
      return data.access_token;
    } catch (error) {
      //console.error('Failed to obtain access token:', error);
      throw new Error('Could not obtain access token');
    }
  }
}

export default OAuthClient;
