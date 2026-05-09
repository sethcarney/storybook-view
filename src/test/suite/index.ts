import * as path from 'path';
import Mocha from 'mocha';
import { readdirSync } from 'fs';

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 60000,
  });
  const testsRoot = path.resolve(__dirname, '.');

  return new Promise((resolve, reject) => {
    const files = readdirSync(testsRoot).filter(f => f.endsWith('.test.js'));
    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
    try {
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
