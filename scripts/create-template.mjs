#!/usr/bin/env node

/* eslint-disable no-console */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { exit, stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const templateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHANGESET_PACKAGE = '@changesets/cli';
const CHANGESET_VERSION = '^2.29.7';
const DEFAULT_GITIGNORE = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files
.env*
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;

function normalizeYesNo(value) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (['y', 'yes', 'true', '1'].includes(normalized)) {
    return 'y';
  }
  if (['n', 'no', 'false', '0'].includes(normalized)) {
    return 'n';
  }
  return undefined;
}

function toBoolean(value) {
  return normalizeYesNo(value) === 'y';
}

function parseCliArgs(args) {
  const result = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--defaults' || arg === '--yes' || arg === '-y') {
      result.useDefaults = true;
      continue;
    }

    if (arg === '--force' || arg === '-f') {
      result.overwrite = 'y';
      continue;
    }

    if (arg === '--skip-install') {
      result.install = 'n';
      continue;
    }

    if ((arg === '--install' || arg === '--with-install') && i + 1 < args.length) {
      result.install = normalizeYesNo(args[i + 1]) ?? 'y';
      i += 1;
      continue;
    }

    if ((arg === '--name' || arg === '--project-name') && i + 1 < args.length) {
      result.name = args[i + 1];
      i += 1;
      continue;
    }

    if ((arg === '--description' || arg === '--desc') && i + 1 < args.length) {
      result.description = args[i + 1];
      i += 1;
      continue;
    }

    if ((arg === '--package-manager' || arg === '--pm') && i + 1 < args.length) {
      result.packageManager = args[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--changesets' && i + 1 < args.length) {
      result.changesets = normalizeYesNo(args[i + 1]) ?? 'y';
      i += 1;
      continue;
    }

    if (arg === '--changesets') {
      result.changesets = 'y';
      continue;
    }

    if (arg === '--with-changesets') {
      result.changesets = 'y';
      continue;
    }

    if (arg === '--no-changesets') {
      result.changesets = 'n';
      continue;
    }

    if (arg === '--git' && i + 1 < args.length) {
      result.git = normalizeYesNo(args[i + 1]) ?? 'y';
      i += 1;
      continue;
    }

    if (arg === '--git') {
      result.git = 'y';
      continue;
    }

    if (arg === '--git-init') {
      result.git = 'y';
      continue;
    }

    if (arg === '--no-git') {
      result.git = 'n';
    }
  }

  return result;
}

const cliOptions = parseCliArgs(process.argv.slice(2));
const envOptions = {
  useDefaults: toBoolean(process.env.NEXT_TEMP_DEFAULTS),
  name: process.env.NEXT_TEMP_NAME,
  description: process.env.NEXT_TEMP_DESCRIPTION,
  packageManager: process.env.NEXT_TEMP_PACKAGE_MANAGER,
  install: normalizeYesNo(process.env.NEXT_TEMP_INSTALL),
  overwrite: normalizeYesNo(process.env.NEXT_TEMP_OVERWRITE),
  changesets: normalizeYesNo(process.env.NEXT_TEMP_CHANGESETS),
  git: normalizeYesNo(process.env.NEXT_TEMP_GIT),
};

const useDefaults = Boolean(cliOptions.useDefaults) || envOptions.useDefaults;
const prefilledAnswers = {
  projectName: cliOptions.name ?? envOptions.name,
  description: cliOptions.description ?? envOptions.description,
  packageManager: cliOptions.packageManager ?? envOptions.packageManager,
  install: cliOptions.install ?? envOptions.install,
  overwrite: cliOptions.overwrite ?? envOptions.overwrite,
  useChangesets: cliOptions.changesets ?? envOptions.changesets,
  initializeGit: cliOptions.git ?? envOptions.git,
};

function getPreset(key) {
  return prefilledAnswers[key];
}

function logAutoResponse(question, value, reason) {
  const suffix = reason ? ` [${reason}]` : '';
  console.log(`${question}: ${value ?? ''}${suffix}`);
}

const rl = createInterface({
  input: stdin,
  output: stdout,
});

async function ask(key, question, defaultValue) {
  const preset = getPreset(key);
  if (preset !== undefined) {
    logAutoResponse(question, preset, 'preset');
    return preset;
  }

  if (useDefaults) {
    logAutoResponse(question, defaultValue ?? '', 'default');
    return defaultValue;
  }

  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || defaultValue;
}

function toPackageName(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, '-');
}

async function ensureTargetDir(targetDir) {
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
    return;
  }

  const contents = await readdir(targetDir);
  if (contents.length === 0) {
    return;
  }

  const overwrite = await ask(
    'overwrite',
    `Directory "${targetDir}" already exists and is not empty. Overwrite? [y/N]`,
    'n'
  );

  if (normalizeYesNo(overwrite) !== 'y') {
    console.log('Aborting setup.');
    rl.close();
    exit(1);
  }

  for (const entry of contents) {
    await rm(join(targetDir, entry), { recursive: true, force: true });
  }
}

const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'];

function normalizePackageManager(input) {
  const value = input.trim().toLowerCase();
  return packageManagers.find((pm) => pm === value) ?? 'pnpm';
}

function getInstallInstruction(packageManager) {
  if (packageManager === 'yarn') {
    return 'yarn install';
  }
  return `${packageManager} install`;
}

function getDevInstruction(packageManager) {
  if (packageManager === 'npm') {
    return 'npm run dev';
  }
  if (packageManager === 'bun') {
    return 'bun run dev';
  }
  return `${packageManager} dev`;
}

function shouldCopy(source) {
  const relPath = relative(templateRoot, source);
  if (!relPath || relPath.startsWith(`..${sep}`) || relPath === '..') {
    return true;
  }

  const [topLevel] = relPath.split(sep);
  const excludedTopLevels = new Set([
    '.git',
    '.next',
    'node_modules',
    '.changeset',
  ]);

  if (excludedTopLevels.has(topLevel)) {
    return false;
  }

  const excludedExactPaths = new Set([
    'scripts/create-template.mjs',
  ]);

  if (excludedExactPaths.has(relPath)) {
    return false;
  }

  return true;
}

async function copyTemplate(destination) {
  const entries = await readdir(templateRoot);

  for (const entry of entries) {
    const sourcePath = join(templateRoot, entry);
    const resolvedSource = resolve(sourcePath);
    const resolvedDestination = resolve(destination);

    if (resolvedSource === resolvedDestination || resolvedSource.startsWith(`${resolvedDestination}${sep}`)) {
      continue;
    }

    if (!shouldCopy(sourcePath)) {
      continue;
    }

    const targetPath = join(destination, entry);
    await cp(sourcePath, targetPath, {
      recursive: true,
      filter: (src) => shouldCopy(src),
    });
  }
}

async function removeIfExists(targetPath) {
  if (!existsSync(targetPath)) {
    return;
  }

  await rm(targetPath, { recursive: true, force: true });
}

async function resetReadme(destDir, projectName) {
  const readmePath = join(destDir, 'README.md');
  if (!existsSync(readmePath)) {
    return;
  }

  const content = `# ${projectName}
\nProject scaffolded with next-temp. Update this README with your project details.\n`;
  await writeFile(readmePath, content, 'utf8');
}

async function removeScaffoldArtifacts(destDir) {
  await removeIfExists(join(destDir, 'LICENSE'));
  await removeIfExists(join(destDir, 'CHANGELOG.md'));

  const cliScriptPath = join(destDir, 'scripts', 'create-template.mjs');
  await removeIfExists(cliScriptPath);

  const scriptsDir = join(destDir, 'scripts');
  if (existsSync(scriptsDir)) {
    const contents = await readdir(scriptsDir);
    if (contents.length === 0) {
      await removeIfExists(scriptsDir);
    }
  }
}

async function ensureChangesetAssets(destDir, includeChangesets) {
  const changesetDir = join(destDir, '.changeset');
  if (includeChangesets) {
    const sourceDir = join(templateRoot, '.changeset');
    if (existsSync(sourceDir)) {
      await removeIfExists(changesetDir);
      await cp(sourceDir, changesetDir, { recursive: true });
    }
    return;
  }

  await removeIfExists(changesetDir);
}

async function ensureGitignore(destDir) {
  const targetPath = join(destDir, '.gitignore');
  if (existsSync(targetPath)) {
    return;
  }

  const templateGitignore = join(templateRoot, '.gitignore');
  let content = DEFAULT_GITIGNORE;

  if (existsSync(templateGitignore)) {
    try {
      content = await readFile(templateGitignore, 'utf8');
    } catch (error) {
      console.warn(`Failed to read template .gitignore: ${error.message}. Using default fallback.`);
    }
  }

  if (!content.endsWith('\n')) {
    content = `${content}\n`;
  }

  await writeFile(targetPath, content, 'utf8');
}

async function updatePackageJson(destDir, answers) {
  const packageJsonPath = join(destDir, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

  packageJson.name = toPackageName(answers.projectName);
  if (answers.description) {
    packageJson.description = answers.description;
  }
  packageJson.private = true;
  delete packageJson.bin;

  if (answers.includeChangesets) {
    packageJson.scripts ??= {};
    packageJson.scripts.changeset = 'changeset';
    packageJson.scripts.release = 'changeset version && pnpm install --no-frozen-lockfile';
    packageJson.devDependencies ??= {};
    packageJson.devDependencies[CHANGESET_PACKAGE] =
      packageJson.devDependencies[CHANGESET_PACKAGE] ?? CHANGESET_VERSION;
  } else {
    if (packageJson.scripts) {
      delete packageJson.scripts.changeset;
      delete packageJson.scripts.release;
      if (Object.keys(packageJson.scripts).length === 0) {
        delete packageJson.scripts;
      }
    }
    if (packageJson.devDependencies) {
      delete packageJson.devDependencies[CHANGESET_PACKAGE];
      if (Object.keys(packageJson.devDependencies).length === 0) {
        delete packageJson.devDependencies;
      }
    }
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
}

async function cleanupLockfiles(destDir, packageManager) {
  const pnpmLock = join(destDir, 'pnpm-lock.yaml');
  if (packageManager !== 'pnpm' && existsSync(pnpmLock)) {
    await rm(pnpmLock, { force: true });
  }
}

async function runCommand(command, args, cwd) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });

    child.on('error', rejectPromise);
  });
}

async function installDependencies(destDir, packageManager) {
  const command = packageManager;
  const args =
    packageManager === 'yarn' ? [] : packageManager === 'bun' ? ['install'] : ['install'];

  if (packageManager === 'yarn') {
    args.push('install');
  }

  await runCommand(command, args, destDir);
}

async function initializeGitRepo(destDir) {
  const gitDir = join(destDir, '.git');
  if (existsSync(gitDir)) {
    console.log('Git repository already exists, skipping git init.');
    return;
  }

  await runCommand('git', ['init'], destDir);
}

async function main() {
  console.log('Welcome to the next-temp project generator!\n');

  const projectName = await ask('projectName', 'Project name', 'my-next-temp-app');
  const description = await ask('description', 'Project description', 'A fresh Next.js starter built with next-temp');
  const packageManagerAnswer = await ask('packageManager', 'Preferred package manager [pnpm/npm/yarn/bun]', 'pnpm');
  const packageManager = normalizePackageManager(packageManagerAnswer);
  const installAnswer = await ask('install', `Install dependencies with ${packageManager}? [y/N]`, 'n');
  const installNormalized = normalizeYesNo(installAnswer) ?? 'n';
  const shouldInstall = installNormalized === 'y';
  const changesetsAnswer = await ask('useChangesets', 'Include Changesets release tooling? [y/N]', 'n');
  const includeChangesets = normalizeYesNo(changesetsAnswer) === 'y';
  const gitAnswer = await ask('initializeGit', 'Initialize a git repository? [Y/n]', 'y');
  const shouldInitializeGit = normalizeYesNo(gitAnswer) !== 'n';

  const targetDir = resolve(process.cwd(), projectName);
  await ensureTargetDir(targetDir);

  console.log(`\nCopying files into ${targetDir}...`);
  await copyTemplate(targetDir);

  await ensureGitignore(targetDir);
  await ensureChangesetAssets(targetDir, includeChangesets);
  await updatePackageJson(targetDir, { projectName, description, includeChangesets });
  await resetReadme(targetDir, projectName);
  await removeScaffoldArtifacts(targetDir);
  await cleanupLockfiles(targetDir, packageManager);

  rl.close();

  if (shouldInstall) {
    console.log(`\nInstalling dependencies with ${packageManager}...`);
    try {
      await installDependencies(targetDir, packageManager);
    } catch (error) {
      console.warn(`\nFailed to install dependencies automatically: ${error.message}`);
      console.warn('You can install them manually using your preferred package manager.');
    }
  }

  if (shouldInitializeGit) {
    console.log('\nInitializing git repository...');
    try {
      await initializeGitRepo(targetDir);
    } catch (error) {
      console.warn(`\nFailed to initialize git repository automatically: ${error.message}`);
      console.warn('You can run "git init" manually when you are ready.');
    }
  }

  console.log('\nAll set! Next steps:');
  console.log(`  1. cd ${projectName}`);
  if (!shouldInstall) {
    console.log(`  2. ${getInstallInstruction(packageManager)}`);
    console.log(`  3. ${getDevInstruction(packageManager)}`);
  } else {
    console.log(`  2. ${getDevInstruction(packageManager)}`);
  }
  if (!shouldInitializeGit) {
    console.log('  • Run "git init" when you want to start version control.');
  }
  if (includeChangesets) {
    console.log('  • Manage releases with: pnpm changeset');
  }
  console.log('\nHappy hacking!');
}

main().catch((error) => {
  rl.close();
  console.error('\nSomething went wrong while creating your project.');
  console.error(error);
  exit(1);
});
