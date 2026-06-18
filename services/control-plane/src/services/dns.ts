import { config } from '../config';
import { logger } from '../logger';

/**
 * dynDNSv4-Integration (https://dyndnsv4.de).
 * Setzt A/AAAA-Records über die Update-API (panel.dyndnsv4.de/nic/update),
 * Auth = Account-E-Mail + Hostname-Token (Basic).
 *
 * DNS_MODE:
 *  - 'wildcard-per-app': pro Tenant KEIN Record nötig — ein Wildcard
 *    *.<app>.<baseDomain> deckt alle Usernamen ab (empfohlen, skaliert).
 *  - 'per-tenant': pro Tenant ein A/AAAA-Record <username>.<app>.<baseDomain> -> LB.
 *  - 'none': DNS extern verwaltet.
 */
export async function ensureTenantRecord(host: string): Promise<void> {
  if (config.DNS_MODE !== 'per-tenant') {
    logger.debug({ host, mode: config.DNS_MODE }, 'per-tenant DNS skipped');
    return;
  }
  if (!config.DYNDNS_USERNAME || !config.DYNDNS_TOKEN) {
    throw new Error('DYNDNS_USERNAME/DYNDNS_TOKEN not configured');
  }
  const params = new URLSearchParams({ hostname: host, myip: config.LB_IPV4 });
  if (config.LB_IPV6) params.set('myipv6', config.LB_IPV6);
  const url = `${config.DYNDNS_API_BASE}/nic/update?${params.toString()}`;
  const auth = Buffer.from(`${config.DYNDNS_USERNAME}:${config.DYNDNS_TOKEN}`).toString('base64');

  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  const body = (await res.text()).trim();
  if (!res.ok || !/^(good|nochg)/i.test(body)) {
    throw new Error(`dyndnsv4 update failed for ${host}: ${res.status} ${body}`);
  }
  logger.info({ host, result: body }, 'dyndnsv4 record set');
}
