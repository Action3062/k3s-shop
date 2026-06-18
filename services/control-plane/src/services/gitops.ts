import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../logger';

let ready: Promise<SimpleGit> | null = null;

async function init(): Promise<SimpleGit> {
  if (!config.GITOPS_REPO_URL) {
    throw new Error('GITOPS_REPO_URL not configured — cannot perform GitOps operations');
  }
  await fs.mkdir(config.GITOPS_WORKDIR, { recursive: true });
  const git = simpleGit(config.GITOPS_WORKDIR);
  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    logger.info({ url: config.GITOPS_REPO_URL.replace(/\/\/[^@]*@/, '//***@') }, 'cloning gitops repo');
    await simpleGit().clone(config.GITOPS_REPO_URL, config.GITOPS_WORKDIR);
  }
  await git.addConfig('user.name', config.GIT_AUTHOR_NAME);
  await git.addConfig('user.email', config.GIT_AUTHOR_EMAIL);
  await git.fetch();
  await git.checkout(config.GITOPS_REPO_BRANCH);
  return git;
}

/** Ensures the gitops repo is cloned + checked out; returns the SimpleGit handle. */
export function ensureRepo(): Promise<SimpleGit> {
  if (!ready) ready = init();
  return ready;
}

async function pull(git: SimpleGit) {
  await git.pull('origin', config.GITOPS_REPO_BRANCH).catch((e) => {
    logger.warn({ err: String(e) }, 'git pull failed (continuing)');
  });
}

/** Write a set of files (paths relative to repo root), commit and push. Returns commit hash. */
export async function writeFilesAndCommit(
  files: Record<string, string>,
  message: string,
): Promise<string> {
  const git = await ensureRepo();
  await pull(git);
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(config.GITOPS_WORKDIR, rel);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content, 'utf8');
    await git.add(rel);
  }
  const res = await git.commit(message);
  await git.push('origin', config.GITOPS_REPO_BRANCH);
  logger.info({ commit: res.commit, files: Object.keys(files), message }, 'gitops push');
  return res.commit;
}

/** Remove a path (file or dir) from the repo, commit and push. Returns commit hash. */
export async function removePathAndCommit(relPath: string, message: string): Promise<string> {
  const git = await ensureRepo();
  await pull(git);
  const full = path.join(config.GITOPS_WORKDIR, relPath);
  await fs.rm(full, { recursive: true, force: true });
  await git.raw(['add', '-A', relPath]);
  const res = await git.commit(message);
  await git.push('origin', config.GITOPS_REPO_BRANCH);
  logger.info({ commit: res.commit, removed: relPath }, 'gitops remove+push');
  return res.commit;
}
