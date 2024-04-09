import readline from 'node:readline/promises';
import { generateKeyPair } from 'node:crypto';

async function createRSA256Pair(passphrase: string) {
  return new Promise<{
    privateKey: string;
    publicKey: string;
  }>((resolve, reject) => {
    generateKeyPair(
      'rsa',
      {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: passphrase,
        },
      },
      (error, publicKey, privateKey) => {
        if (error) {
          reject(error);
        }

        resolve({ privateKey, publicKey });
      },
    );
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const passphrase = await rl.question('Please, provide passphrase:\n> ');

  const RSAPair = await createRSA256Pair(passphrase);

  rl.write(`Private key:\n${RSAPair.privateKey}`);
  rl.write(`Private key:\n${RSAPair.publicKey}`);

  rl.close();

  console.log('\n\nHave a great day!');

  process.exit(0);
})().catch((error: unknown) => {
  rl.close();

  console.error(error);

  process.exit(1);
});
