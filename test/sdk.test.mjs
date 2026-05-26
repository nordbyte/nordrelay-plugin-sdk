import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import { createHost, ok, ui } from "../dist/index.js";

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

test("renders official NordRelay plugin UI building blocks", () => {
  assert.equal(ui.badge("Latest", "enabled"), '<span class="badge enabled">Latest</span>');
  assert.equal(ui.button("Open", { variant: "secondary", mini: true, data: { pluginPanelOpen: "system-monitor" } }), '<button type="button" class="secondary mini-button" data-plugin-panel-open="system-monitor">Open</button>');
  assert.equal(ui.metric("CPU", "12%", { detail: "1m avg" }), '<div class="metric"><div class="label">CPU</div><div class="value">12%</div><small>1m avg</small></div>');
  assert.equal(ui.progress(150), '<div class="progress"><span class="progress-fill" style="width:100%"></span></div>');
});

test("renders escaped tables with raw custom cells", () => {
  const html = ui.table([
    { key: "name", label: "Name", className: "primary-cell" },
    { label: "Status", render: () => ui.badge("ok", "enabled") },
  ], [{ name: "<node>" }], { className: "nodes-table", minWidth: 720 });

  assert.match(html, /class="data-table nodes-table"/);
  assert.match(html, /style="--table-min-width:720px"/);
  assert.match(html, /&lt;node&gt;/);
  assert.match(html, /<span class="badge enabled">ok<\/span>/);
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
