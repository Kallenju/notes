import fs from 'node:fs/promises';
import path from 'node:path';
import { createWriteStream } from 'node:fs';
import type { IncomingMessage } from 'http';
import type { Readable } from 'stream';
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

import { BASE_FRONTEND_PATH } from '../shared/constants.js';
import { config } from '../shared/config.js';
import { logger } from './logger.js';

const AWS_REGION = 'eu-central-1' as const;

const publicFolder = path.resolve(BASE_FRONTEND_PATH, 'public');
const viewsFolder = path.resolve(BASE_FRONTEND_PATH, 'views');

async function downloadFile(s3Client: S3Client, key: string): Promise<void> {
  const getObjectParams = {
    Bucket: config.AWS_FRONTEND_BUCKET,
    Key: key,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(getObjectParams));

    if (!data.Body) {
      throw new Error('data.Body is undefined');
    }

    const filePath = path.resolve(publicFolder, key);

    await fs.mkdir(path.dirname(filePath), { recursive: true });

    const writeStream = createWriteStream(filePath);

    (data.Body as IncomingMessage | Readable).pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  } catch (error) {
    logger.error(
      `Cannot download file ${key}. Error:\n${error instanceof Error && error.stack ? error.stack : error}\n____________________________________\n`,
    );

    throw error;
  }
}

export async function fetchAndCacheFiles(): Promise<void> {
  if (config.NODE_ENV !== 'production') {
    return;
  }

  let client: S3Client | null = null;

  try {
    await Promise.all([
      fs.rm(publicFolder, { recursive: true, force: true }),
      fs.rm(viewsFolder, { recursive: true, force: true }),
    ]);

    client = new S3Client({ region: AWS_REGION });

    const listObjectsResponse = await client.send(
      new ListObjectsV2Command({
        Bucket: config.AWS_FRONTEND_BUCKET,
      }),
    );

    if (!listObjectsResponse.Contents) {
      throw new Error('listObjectsResponse.Contents is undefined');
    }

    await Promise.all(
      listObjectsResponse.Contents.map(async ({ Key }) =>
        Key ? downloadFile(client!, Key) : null,
      ),
    );
  } catch (error) {
    logger.error(
      `Cannot fetch assets. Error:\n${error instanceof Error && error.stack ? error.stack : error}\n____________________________________\n`,
    );

    throw error;
  } finally {
    client?.destroy();
  }
}
