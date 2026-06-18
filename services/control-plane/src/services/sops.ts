import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { config } from '../config';

/** Verschlüsselt ein k8s-Secret-YAML mit SOPS/age (nur data/stringData). Flux entschlüsselt im Cluster. */
export async function encryptSecretYaml(yaml: string): Promise<string> {
  if (!config.SOPS_AGE_RECIPIENT) throw new Error('SOPS_AGE_RECIPIENT not configured');
  const tmp = path.join(os.tmpdir(), `secret-${Date.now()}-${Math.random().toString(36).slice(2)}.yaml`);
  await fs.writeFile(tmp, yaml, 'utf8');
  try {
    return await new Promise<string>((resolve, reject) => {
      const child = spawn('sops', [
        '--encrypt', '--age', config.SOPS_AGE_RECIPIENT!,
        '--encrypted-regex', '^(data|stringData)$',
        '--input-type', 'yaml', '--output-type', 'yaml', tmp,
      ]);
      let out = ''; let err = '';
      child.stdout.on('data', (d) => (out += d.toString()));
      child.stderr.on('data', (d) => (err += d.toString()));
      child.on('error', reject);
      child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`sops failed: ${err}`))));
    });
  } finally {
    await fs.rm(tmp, { force: true });
  }
}
