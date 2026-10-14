import { execFile } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { promisify } from 'node:util';
import { SDK_REPO_URL, SDK_SOURCE_DIR, SDK_VERSION } from '../config';

const run = promisify(execFile);

function clonedVersion(): string | undefined {
  const packageJson = `${SDK_SOURCE_DIR}/packages/sdk/package.json`;
  if (!existsSync(packageJson)) return undefined;
  return JSON.parse(readFileSync(packageJson, 'utf8')).version;
}

/** Shallow-clones the studio-sdk repo at the pinned tag; no-op if that version is already present. */
export async function fetchSdkSource(): Promise<string> {
  if (clonedVersion() === SDK_VERSION) return SDK_SOURCE_DIR;

  rmSync(SDK_SOURCE_DIR, { recursive: true, force: true });
  await run('git', [
    'clone', '--quiet', '--depth', '1', '--branch', SDK_VERSION, `${SDK_REPO_URL}.git`, SDK_SOURCE_DIR,
  ]);

  const version = clonedVersion();
  if (version !== SDK_VERSION) {
    throw new Error(`Expected studio-sdk ${SDK_VERSION} at tag, found ${version ?? 'nothing'}`);
  }
  return SDK_SOURCE_DIR;
}

if (import.meta.main) {
  const dir = await fetchSdkSource();
  console.log(`studio-sdk ${SDK_VERSION} source at ${dir}`);
}
