import { spawn } from 'child_process';
import { config } from '../config';

function run(args: string[], stdin?: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (config.KUBECONFIG) env.KUBECONFIG = config.KUBECONFIG;
    const child = spawn('kubectl', args, { env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? -1, stdout, stderr }));
    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
}

/** Apply one or more YAML docs via `kubectl apply -f -` (kubectl mode / direct path). */
export async function applyManifests(yaml: string): Promise<void> {
  const r = await run(['apply', '-f', '-'], yaml);
  if (r.code !== 0) throw new Error(`kubectl apply failed: ${r.stderr || r.stdout}`);
}

/** Returns true if the named deployment reports availableReplicas >= 1. */
export async function isDeploymentReady(namespace: string, name: string): Promise<boolean> {
  const r = await run([
    '-n', namespace, 'get', 'deploy', name,
    '-o', 'jsonpath={.status.availableReplicas}',
  ]);
  if (r.code !== 0) return false;
  return Number(r.stdout.trim() || '0') >= 1;
}

/** Create a hcloud-csi VolumeSnapshot for a PVC (best-effort backup). */
export async function createVolumeSnapshot(namespace: string, pvc: string, name: string): Promise<void> {
  const snap = [
    'apiVersion: snapshot.storage.k8s.io/v1',
    'kind: VolumeSnapshot',
    'metadata:',
    `  name: ${name}`,
    `  namespace: ${namespace}`,
    'spec:',
    '  volumeSnapshotClassName: hcloud-volumes', // VolumeSnapshotClass muss existieren
    '  source:',
    `    persistentVolumeClaimName: ${pvc}`,
    '',
  ].join('\n');
  await applyManifests(snap);
}
