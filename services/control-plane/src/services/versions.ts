import { getImagePolicyLatest, getDeploymentStatus } from './kubeStatus';

/** Extrahiert den Tag aus "repo:tag" (ohne Digest-Teil). */
export function tagOf(image?: string | null): string | undefined {
  if (!image) return undefined;
  const ref = image.split('@')[0];
  const i = ref.lastIndexOf(':');
  return i > 0 ? ref.slice(i + 1) : undefined;
}

/** Neueste verfuegbare Version laut Flux-ImagePolicy <appSlug>; undefined, wenn keine Policy existiert. */
export async function appLatest(appSlug: string): Promise<string | undefined> {
  return tagOf(await getImagePolicyLatest(appSlug));
}

/**
 * Tag zum Pinnen des HelmRelease.
 * toLatest=true (Provision/Neustart) -> neueste Version; sonst laufende Version beibehalten.
 * undefined (= kein Pin, Chart-Default) wenn fuer die App keine ImagePolicy existiert.
 */
export async function resolveAppTag(
  inst: { appSlug: string; namespace: string },
  toLatest: boolean,
): Promise<string | undefined> {
  const latest = await appLatest(inst.appSlug);
  if (!latest) return undefined;
  if (toLatest) return latest;
  const cur = tagOf((await getDeploymentStatus(inst.namespace, inst.appSlug)).image);
  return cur ?? latest;
}

/** image-Objekt zum Mergen in die HelmRelease-Values ({} wenn keine ImagePolicy/Version). */
export async function appImageValues(
  inst: { appSlug: string; namespace: string },
  toLatest: boolean,
): Promise<Record<string, unknown>> {
  const tag = await resolveAppTag(inst, toLatest);
  return tag ? { image: { tag } } : {};
}
