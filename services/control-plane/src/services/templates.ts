import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config';
import { ensureRepo } from './gitops';

export interface TenantVars {
  namespace: string;
  tenant: string;
  app: string;
  cpuRequest: string;
  memRequest: string;
  cpuLimit: string;
  memLimit: string;
  storage: string;
}

const TEMPLATE_FILES = [
  'namespace.yaml',
  'resourcequota.yaml',
  'limitrange.yaml',
  'networkpolicy.yaml',
];

/** Reads platform/tenant-template/* from the cloned gitops repo and substitutes tokens. */
export async function renderTenantTemplate(v: TenantVars): Promise<Record<string, string>> {
  await ensureRepo();
  const dir = path.join(config.GITOPS_WORKDIR, 'platform/tenant-template');
  const out: Record<string, string> = {};
  for (const file of TEMPLATE_FILES) {
    const raw = await fs.readFile(path.join(dir, file), 'utf8');
    out[file] = raw
      .replace(/__NAMESPACE__/g, v.namespace)
      .replace(/__TENANT__/g, v.tenant)
      .replace(/__APP__/g, v.app)
      .replace(/__CPU_REQUEST__/g, v.cpuRequest)
      .replace(/__MEM_REQUEST__/g, v.memRequest)
      .replace(/__CPU_LIMIT__/g, v.cpuLimit)
      .replace(/__MEM_LIMIT__/g, v.memLimit)
      .replace(/__STORAGE__/g, v.storage);
  }
  return out;
}
