"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const OAuthClient_1 = __importDefault(require("./src/classes/FHIR/OAuthClient"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000; // Default port is 3000 if PORT environment variable is not set
app.get('/', (req, res) => {
    // Example usage:
    // Create an instance of the OAuthClient class with appropriate configuration
    const config = {
        clientId: '04974aca-a8dd-449f-905e-8a64c75b8724',
        tokenEndpoint: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
        privateKeyPath: './keys2/privatekey.pem',
        publicKeyPath: './keys2/publickey509.pem',
        jwtAlgorithm: 'RS384',
    };
    const oauthClient = new OAuthClient_1.default(config);
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
    const jwk = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, 'keys2/public.jwk'), 'utf8'));
    res.json({ keys: [jwk] });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
