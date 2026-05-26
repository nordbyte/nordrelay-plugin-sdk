import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import { createHost, ok } from "../dist/index.js";

test("creates a scoped host helper", () => {
  const host = createHost({
    permissions: ["runtime.read"],
    context: { runtime: { version: "0.1.0" } },
  });

  assert.equal(host.hasPermission("runtime.read"), true);
  assert.equal(host.hasPermission("sessions.read"), false);
  assert.deepEqual(host.getContext("runtime"), { version: "0.1.0" });
  assert.throws(() => host.requirePermission("sessions.read"), /Plugin permission required/);
});

test("creates ok results", () => {
  assert.deepEqual(ok({ value: 1 }), { ok: true, output: { value: 1 } });
});

test("supports collector requests", async () => {
  const payload = JSON.stringify({
    protocolVersion: 1,
    type: "collector",
    pluginId: "system-monitor",
    collectorId: "system.sample",
    input: {},
    settings: {},
    dataDir: "/tmp/plugin",
    permissions: ["system.metrics.read"],
    context: {},
  });
  const child = spawnSync(process.execPath, [
    "--input-type=module",
    "-e",
    "import { runCollector, ok } from './dist/index.js'; await runCollector(async ({ collectorId, host }) => { host.requirePermission('system.metrics.read'); return ok({ collectorId }); });",
  ], { input: payload, encoding: "utf8" });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), { ok: true, output: { collectorId: "system.sample" } });
});
