const crypto = require('crypto');
const fs = require('fs');

function genKeyPair() {
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  fs.writeFileSync(__dirname + '/id_rsa.pub', keyPair.publicKey);

  fs.writeFileSync(__dirname + '/id_rsa', keyPair.privateKey);
}

// Generate the keypair
genKeyPair();
