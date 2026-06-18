import { randomBytes } from 'crypto';

/** Erzeugt ein Gateway-Token (256-bit, hex) wie von OpenClaw empfohlen. */
export function generateGatewayToken(): string {
  return randomBytes(32).toString('hex');
}

/** Rendert das (unverschlüsselte) Secret-Manifest für das OpenClaw Gateway-Token. */
export function renderGatewaySecret(namespace: string, token: string): string {
  return [
    'apiVersion: v1',
    'kind: Secret',
    'metadata:',
    '  name: openclaw-secrets',
    `  namespace: ${namespace}`,
    'type: Opaque',
    'stringData:',
    `  OPENCLAW_GATEWAY_TOKEN: ${token}`,
    '',
  ].join('\n');
}
