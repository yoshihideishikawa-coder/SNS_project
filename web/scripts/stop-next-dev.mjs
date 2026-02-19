#!/usr/bin/env node
import { execSync } from "node:child_process";
import process from "node:process";

const PROJECT_DIR = process.cwd();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getProjectNextDevProcesses(projectDir) {
  try {
    const psOutput = execSync("ps -ax -o pid= -o command=", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return psOutput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const firstSpace = line.indexOf(" ");
        if (firstSpace === -1) {
          return null;
        }

        const pid = Number.parseInt(line.slice(0, firstSpace).trim(), 10);
        const command = line.slice(firstSpace + 1);
        return { pid, command };
      })
      .filter(
        (item) =>
          item &&
          Number.isInteger(item.pid) &&
          item.pid !== process.pid &&
          item.command.includes("next dev") &&
          item.command.includes(projectDir)
      );
  } catch {
    return [];
  }
}

const processes = getProjectNextDevProcesses(PROJECT_DIR);

if (processes.length === 0) {
  console.log("[stop-next-dev] No running next dev process found for this project.");
  process.exit(0);
}

for (const item of processes) {
  try {
    process.kill(item.pid, "SIGTERM");
    console.log(`[stop-next-dev] Stopped next dev process PID ${item.pid}.`);
  } catch (error) {
    console.error(`[stop-next-dev] Failed to stop PID ${item.pid}:`, error);
    process.exitCode = 1;
  }
}

for (const item of processes) {
  await sleep(300);
  try {
    process.kill(item.pid, 0);
    process.kill(item.pid, "SIGKILL");
    console.log(`[stop-next-dev] Force killed PID ${item.pid}.`);
  } catch {
    // Process already exited after SIGTERM.
  }
}
