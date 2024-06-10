const fs = require('fs');
const jose = require('node-jose');

async function convertPemToJwk() {
  // Read the public key in PEM format
  const pem = fs.readFileSync('./keys2/publickey509.pem', 'utf8');

  // Create a JWK from the PEM
  const key = await jose.JWK.asKey(pem, 'pem');

  // Convert the JWK to a JSON representation
  const jwk = key.toJSON();

  // Save the JWK to a file
  fs.writeFileSync('./public.jwk', JSON.stringify({ keys: [jwk] }, null, 2));
  
  console.log('JWK has been saved to public.jwk');
}

convertPemToJwk().catch(console.error);
