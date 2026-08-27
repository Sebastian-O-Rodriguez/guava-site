/**
 * guava-site session gate — project-session variant.
 *
 * On `session_start`, run `guava-os work` (this project). No ready work →
 * block execution tools. `work` gates on `ready-for-work` (exit 0 = ready).
 */
import { execFileSync } from "node:child_process";
import type { HookAPI } from "@oh-my-pi/pi-coding-agent/extensibility/hooks";

const GUAVA_OS = "/Users/sebroot/dev/guava-os";
const TSX = `${GUAVA_OS}/node_modules/.bin/tsx`;
const CLI = `${GUAVA_OS}/.guava-os/src/cli.ts`;

const EXECUTION_TOOLS: Record<string, true> = {
  bash: true,
  edit: true,
  write: true,
  task: true,
  eval: true,
};

let noReadyWork = false;

export default function (pi: HookAPI): void {
  pi.on("session_start", async (_event, ctx) => {
    let hasWork = false;
    let output = "";
    try {
      output = execFileSync(TSX, [CLI, "work"], {
        cwd: ctx.cwd ?? process.cwd(),
        encoding: "utf8",
      }).trim();
      hasWork = true;
    } catch (err) {
      const e = err as { status?: number; stdout?: string | Buffer };
      output = (e.stdout?.toString() ?? "").trim();
      hasWork = false;
    }

    noReadyWork = !hasWork;

    if (!hasWork) {
      pi.sendMessage?.({ type: "text", content: "No ready work for guava-site — closing session." });
      return;
    }

    pi.sendMessage?.({
      type: "text",
      content: `Ready work:\n${output}\n\nDispatch by domain — see .omp/AGENTS.md and docs/architecture/linear-conventions.md.`,
    });
  });

  pi.on("tool_call", async (event) => {
    if (!noReadyWork) return;
    if (!EXECUTION_TOOLS[event.toolName]) return;
    if (process.env.GUAVA_OS_ALLOW_NO_WORK) return;
    return {
      block: true,
      reason:
        "No ready-for-work issues for guava-site — session gate blocks execution. Set GUAVA_OS_ALLOW_NO_WORK=1 to override.",
    };
  });
}