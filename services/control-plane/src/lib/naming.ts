export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export interface TenantNaming {
  username: string;
  app: string;
  subdomain: string; // <username>.<app>
  namespace: string; // tenant-<username>-<app>
  host: string;      // <username>.<app>.<baseDomain>
  url: string;
}

/** Domain-Schema: <username>.<appname>.<baseDomain>  (z. B. thomas.vaultwarden.dyndnsv4.de) */
export function tenantNames(opts: {
  username: string;
  appSlug: string;
  baseDomain: string;
}): TenantNaming {
  const username = slugify(opts.username);
  const app = slugify(opts.appSlug);
  const subdomain = `${username}.${app}`;
  const namespace = `tenant-${username}-${app}`;
  const host = `${subdomain}.${opts.baseDomain}`;
  return { username, app, subdomain, namespace, host, url: `https://${host}` };
}
