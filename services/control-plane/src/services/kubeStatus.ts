import https from 'https';
import { readFileSync } from 'fs';

const SA = '/var/run/secrets/kubernetes.io/serviceaccount';

function creds() {
  let token = '';
  let ca: Buffer | undefined;
  try { token = readFileSync(`${SA}/token`, 'utf8').trim(); } catch { /* not in-cluster */ }
  try { ca = readFileSync(`${SA}/ca.crt`); } catch { /* ignore */ }
  const host = process.env.KUBERNETES_SERVICE_HOST || 'kubernetes.default.svc';
  const port = Number(process.env.KUBERNETES_SERVICE_PORT_HTTPS || process.env.KUBERNETES_SERVICE_PORT || 443);
  return { token, ca, host, port };
}

export interface DeployStatus { found: boolean; desired: number; ready: number; }

/** Read-only: liest den Deployment-Status (spec.replicas / status.readyReplicas) im Tenant-Namespace. */
export async function getDeploymentStatus(namespace: string, name: string): Promise<DeployStatus> {
  const { token, ca, host, port } = creds();
  if (!token) return { found: false, desired: 0, ready: 0 };
  return new Promise((resolve) => {
    const req = https.request(
      {
        host, port, method: 'GET', ca,
        path: `/apis/apps/v1/namespaces/${namespace}/deployments/${name}`,
        headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          const code = res.statusCode ?? 500;
          if (code >= 300) return resolve({ found: false, desired: 0, ready: 0 });
          try {
            const o = JSON.parse(body);
            resolve({ found: true, desired: o.spec?.replicas ?? 0, ready: o.status?.readyReplicas ?? 0 });
          } catch { resolve({ found: false, desired: 0, ready: 0 }); }
        });
      },
    );
    req.on('error', () => resolve({ found: false, desired: 0, ready: 0 }));
    req.setTimeout(4000, () => { req.destroy(); resolve({ found: false, desired: 0, ready: 0 }); });
    req.end();
  });
}

/** Mappt DB-Intent + echte Pod-Readiness auf den anzuzeigenden Status. */
export function computeLiveStatus(dbStatus: string, st: DeployStatus): string {
  if (dbStatus === 'DEPROVISIONED' || dbStatus === 'DEPROVISIONING' || dbStatus === 'FAILED') return dbStatus;
  if (!st.found) return dbStatus === 'SUSPENDED' ? 'SUSPENDED' : 'PROVISIONING';
  if (st.desired === 0) return 'SUSPENDED';
  if (st.ready >= 1) return 'RUNNING';
  return 'PROVISIONING';
}
