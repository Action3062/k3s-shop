import { getImagePolicyLatest, getDeploymentStatus } from './kubeStatus';

/** Extrahiert den Tag aus "repo:tag" (ohne Digest-Teil). */
export function tagOf(image?: string | null): string | undefined {
  if (!image) return undefined;
  const ref = image.split('@')[0];           // evtl. @sha256:... abschneiden
  const i = ref.lastIndexOf(':');
  return i > 0 ? ref.slice(i + 1) : undefined;
}

/** Neueste verfuegbare openclaw-Version laut Flux-ImagePolicy (z. B. "v2026.6.9"). */
export async function openclawLatest(): Promise<string | undefined> {
  return tagOf(await getImagePolicyLatest('openclaw'));
}

/**
 * Tag, mit dem das HelmRelease gepinnt wird.
 * toLatest=true (Provision/Neustart) -> neueste Version; sonst aktuell laufende Version beibehalten.
 * Nur fuer openclaw; andere Apps bleiben beim Chart-Default (undefined).
 */
export async function resolveOpenclawTag(
  inst: { appSlug: string; namespace: string },
  toLatest: boolean,
): Promise<string | undefined> {
  if (inst.appSlug !== 'openclaw') return undefined;
  const latest = await openclawLatest();
  if (toLatest) return latest;
  const cur = tagOf((await getDeploymentStatus(inst.namespace, 'openclaw')).image);
  return cur ?? latest;
}

/** Liefert das in die HelmRelease-Values zu mergende image-Objekt ({} fuer Nicht-openclaw). */
export async function openclawImageValues(
  inst: { appSlug: string; namespace: string },
  toLatest: boolean,
): Promise<Record<string, unknown>> {
  const tag = await resolveOpenclawTag(inst, toLatest);
  return tag ? { image: { tag } } : {};
}
