"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class OAuthClient {
    constructor(config) {
        this.clientId = config.clientId;
        this.tokenEndpoint = config.tokenEndpoint;
        this.privateKey = fs.readFileSync(path.resolve(config.privateKeyPath), 'utf8');
        this.publicKey = fs.readFileSync(path.resolve(config.publicKeyPath), 'utf8');
        this.jwtAlgorithm = config.jwtAlgorithm;
    }
    generateJWT() {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: this.clientId,
            sub: this.clientId,
            aud: this.tokenEndpoint,
            jti: this.generateJTI(),
            exp: now + 3600,
            iat: now,
        };
        return jwt.sign(payload, this.privateKey, { algorithm: this.jwtAlgorithm });
    }
    generateJTI() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const jwtToken = this.generateJWT();
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
            params.append('client_assertion', jwtToken);
            try {
                const response = yield axios_1.default.post(this.tokenEndpoint, params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                const data = response.data;
                return data.access_token;
            }
            catch (error) {
                console.error('Failed to obtain access token:', error);
                throw new Error('Could not obtain access token');
            }
        });
    }
}
exports.default = OAuthClient;
