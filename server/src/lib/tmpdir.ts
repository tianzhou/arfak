import os from 'node:os';
import path from 'node:path';

export function getDefaultTmpDir(): string {
  if (process.platform === 'win32') {
    return path.join(os.tmpdir(), 'arfak');
  }
  return '/tmp/arfak';
}
