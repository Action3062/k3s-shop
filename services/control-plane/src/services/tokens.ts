import { randomBytes } from 'crypto';

/** Erzeugt ein Gateway-Passwort (256-bit, hex). */
export function generateGatewayToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Rendert das (unverschlüsselte) Secret-Manifest für den OpenClaw-Gateway-Zugang.
 * Die neue Image authentifiziert per Benutzer + Passwort (kein Single-Token mehr)
 * und verweigert den LAN-Start ohne beide Werte. Username = DNS-Label des Tenants,
 * Passwort = generierter Token (in DB als gatewayToken gespeichert).
 */
export function renderGatewaySecret(namespace: string, user: string, password: string): string {
  return [
    'apiVersion: v1',
    'kind: Secret',
    'metadata:',
    '  name: openclaw-secrets',
    `  namespace: ${namespace}`,
    'type: Opaque',
    'stringData:',
    `  OPENCLAW_GATEWAY_AUTH_USER: ${user}`,
    `  OPENCLAW_GATEWAY_AUTH_PASSWORD: ${password}`,
    '',
  ].join('\n');
}
