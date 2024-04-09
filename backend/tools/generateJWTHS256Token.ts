import readline from 'node:readline/promises';
import jwt from 'jsonwebtoken';

function generateHS256Token(server: string, key: string) {
  switch (server) {
    case 'frontend-server': {
      const payload = {
        sub: 'frontend-server',
        scope: 'server',
      };

      const header = {
        alg: 'HS256',
        typ: 'JWT',
      };

      return jwt.sign(payload, key, {
        algorithm: 'HS256',
        expiresIn: '7d',
        header,
      });
    }
    default: {
      throw new Error('Wrong application');
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const server = await rl.question('What server is the key created for?\n> ');
  const jwtSecretKey = await rl.question('Please, provide JWT secret key:\n> ');

  const accessToken = generateHS256Token(server, jwtSecretKey);

  rl.write(`Access Token:\n${accessToken}`);
  rl.write('\nHave a great day!');

  rl.close();

  process.exit(0);
})().catch((error) => {
  rl.close();

  console.error(error);

  process.exit(1);
});
