#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export function expectedGen2Version(root) {
  const driver = path.join(root, 'compiler', 'razc', 'src', 'driver', 'main.raz');
  const source = fs.readFileSync(driver, 'utf8');
  const match = /razc Gen2 preview ([0-9]+\.[0-9]+\.[0-9]+-g2-[0-9]+)/.exec(source);
  if (!match) throw new Error(`cannot determine expected Gen2 version from ${driver}`);
  return match[1];
}

export function assertGen2Version(actualOutput, expected, binaryPath) {
  const match = /razc Gen2 preview ([0-9]+\.[0-9]+\.[0-9]+-g2-[0-9]+)/.exec(actualOutput);
  const actual = match?.[1] ?? 'unknown';
  if (actual !== expected) {
    throw new Error(
      `stale or incompatible Gen2 candidate: expected ${expected}, got ${actual}\n` +
      `binary: ${binaryPath}\n` +
      `rebuild it with: make build-gen2-selfhost`,
    );
  }
}

export function resolveGen2Binary(root, override = process.env.RAZC) {
  const executable = process.platform === 'win32' ? 'razc.exe' : 'razc';
  const candidateName = process.platform === 'win32' ? 'razc-candidate.exe' : 'razc-candidate';
  const candidate = path.join(root, 'compiler', 'razc', 'build', candidateName);
  const active = path.join(root, 'compiler', 'razc', 'bin', executable);
  if (override) return path.resolve(root, override);

  const expected = expectedGen2Version(root);
  const stale = [];
  for (const binary of [candidate, active]) {
    if (!fs.existsSync(binary)) continue;
    const result = spawnSync(binary, ['--version'], { cwd: root, encoding: 'utf8', timeout: 5000 });
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    const match = /razc Gen2 preview ([0-9]+\.[0-9]+\.[0-9]+-g2-[0-9]+)/.exec(output);
    const actual = match?.[1] ?? 'unknown';
    if (result.status === 0 && actual === expected) {
      if (binary === active && fs.existsSync(candidate) && stale.length) {
        console.warn(`[gen2-version] ignoring stale candidate (${stale.join('; ')}); using active ${active}`);
      }
      return binary;
    }
    stale.push(`${binary}: ${actual}`);
  }

  throw new Error(
    `no executable Gen2 compiler matching source version ${expected}; ${stale.join('; ') || 'no Gen2 binaries found'}. ` +
    `Build one with: make build-gen2-selfhost`,
  );
}
