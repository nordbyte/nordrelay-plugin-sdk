import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import { createHost, generatePluginMarkdown, manifest, ok, panelEventsScript, panelJobRunnerScript, pluginJobBadge, ui } from "../dist/index.js";

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

test("builds typed manifests and generated docs", () => {
  const plugin = manifest.define({
    id: "example-plugin",
    name: "Example Plugin",
    version: "0.1.0",
    permissions: ["runtime.read"],
    capabilities: {
      commands: [manifest.command("refresh", "Refresh")],
    },
  });
  assert.equal(plugin.id, "example-plugin");
  assert.match(generatePluginMarkdown(plugin), /`runtime\.read`/);
  assert.match(generatePluginMarkdown(plugin), /`refresh`/);
});

test("renders form, chart, tabs, and job badges", () => {
  assert.match(ui.form([{ key: "enabled", label: "Enabled", type: "boolean", value: true }]), /type="checkbox"/);
  assert.match(ui.chart([{ label: "CPU", values: [1, 2, 3] }]), /metrics-chart/);
  assert.match(ui.tabs([{ id: "overview", label: "Overview", active: true }]), /aria-selected="true"/);
  assert.equal(pluginJobBadge({ id: "1", pluginId: "p", title: "Job", status: "completed", input: {}, logs: [], createdAt: new Date().toISOString() }), '<span class="badge enabled">completed</span>');
  assert.match(panelEventsScript(), /subscribe\?\.\("jobs"/);
  assert.match(panelJobRunnerScript({ buttonSelector: "[data-run]", command: "refresh" }), /api\.jobs\.start\("refresh"/);
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
