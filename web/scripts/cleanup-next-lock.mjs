#!/usr/bin/env node
import { access, lstat, readFile, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const NEXT_LOCK_PATH = path.join(process.cwd(), ".next", "dev", "lock");

async function lockExists(lockPath) {
  try {
    await access(lockPath);
    return true;
  } catch {
    return false;
  }
}

function isPidRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const exists = await lockExists(NEXT_LOCK_PATH);
  if (!exists) {
    return;
  }

  let lockStat;
  try {
    lockStat = await lstat(NEXT_LOCK_PATH);
  } catch {
    return;
  }

  if (lockStat.isDirectory()) {
    console.warn(
      `[cleanup-next-lock] Expected file but found directory, skipping: ${NEXT_LOCK_PATH}`
    );
    return;
  }

  let lockContent = "";
  try {
    lockContent = await readFile(NEXT_LOCK_PATH, "utf8");
  } catch {
    // Ignore parse/read failure; fallback is to remove stale lock.
  }

  const pid = Number.parseInt(lockContent.trim(), 10);
  if (isPidRunning(pid)) {
    console.error(
      `[cleanup-next-lock] next dev is already running for this project (PID: ${pid}).`
    );
    console.error(
      "[cleanup-next-lock] Stop the existing process before running npm run dev again."
    );
    process.exitCode = 1;
    return;
  }

  await rm(NEXT_LOCK_PATH, { force: true });
  console.log(`[cleanup-next-lock] Removed stale lock file: ${NEXT_LOCK_PATH}`);
}

main().catch((error) => {
  console.error("[cleanup-next-lock] Failed:", error);
  process.exitCode = 1;
});
