import readline from 'node:readline/promises';
import jwt from 'jsonwebtoken';

function generateRSAToken(server: string, key: string, passphrase: string) {
  if (
    server !== 'auth-server' &&
    server !== 'frontend-server' &&
    server !== 'notes-server'
  ) {
    throw new Error('Wrong server');
  }

  return jwt.sign(
    {
      sub: server,
      scope: 'server',
    },
    { key, passphrase },
    { algorithm: 'RS256' },
  );
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const server = await rl.question('What server is the key created for?\n> ');
  const privateKey = await rl.question('Please, provide private key:\n> ');
  const passphrase = await rl.question('Please, provide passphrase:\n> ');

  const RSAToken = generateRSAToken(server, privateKey, passphrase);

  rl.write(`RSA Token:\n${RSAToken}`);
  rl.write('\nHave a great day!');

  rl.close();

  process.exit(0);
})().catch((error) => {
  rl.close();

  console.error(error);

  process.exit(1);
});
