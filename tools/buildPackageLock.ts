import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'url';

import Arborist from "@npmcli/arborist";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packagePath = path.resolve(__dirname, '..', process.argv[2]);
const packageLockFilePath = path.resolve(packagePath, "package-lock.json");
const packageLockFileExists = fs.existsSync(packageLockFilePath);

if (!packageLockFileExists || (packageLockFileExists && process.argv[3] === 'force')) {
  if (packageLockFileExists) {
    fs.unlinkSync(packageLockFilePath);
  }

  const arb = new Arborist({
    path: packagePath,
  });
  
  const { meta } = await arb.buildIdealTree();
  
  if (!meta) {
    throw new Error('Arborist meta is undefined');
  }
  
  meta.commit();
  
  await fs.promises.writeFile(packageLockFilePath, meta.toString());
}
