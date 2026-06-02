# NordRelay Plugin SDK

Small dependency-free helpers and public types for NordRelay plugins.

NordRelay sends one JSON request to the plugin process on stdin and expects one
JSON result on stdout. The SDK keeps plugin code small while making the request,
permission and result contracts explicit.

## Example

Install:

```sh
npm install @nordbyte/nordrelay-plugin-sdk
```

```js
import { runWorkflowAction } from "@nordbyte/nordrelay-plugin-sdk";

runWorkflowAction(async ({ input, settings, context, host }) => {
  const runtime = host.getContext("runtime");
  host.requirePermission("runtime.read");

  return {
    ok: true,
    output: {
      input,
      prefix: settings.prefix,
      node: runtime?.nodeName
    }
  };
});
```

Host data in `context` is already filtered by NordRelay based on the permissions declared and approved for the plugin. Plugins run with a sanitized environment and their `HOME`/temporary directories point to the plugin data directory.

Plugins that declare and receive `usage.read` can access
`host.getContext("usage")` for normalized session token counters. The usage
context contains session metadata and token totals only; prompt contents are not
included.

## Manifest

Use the typed manifest builder when authoring plugins:

```js
import { manifest } from "@nordbyte/nordrelay-plugin-sdk";

export default manifest.define({
  id: "example-plugin",
  name: "Example Plugin",
  version: "0.1.0",
  entry: "index.js",
  permissions: ["runtime.read"],
  capabilities: {
    commands: [
      manifest.command("refresh", "Refresh data", {
        timeoutMs: 30000
      })
    ],
    webPanels: [
      manifest.webPanel("dashboard", "Dashboard", {
        allowClientScript: true
      })
    ]
  }
});
```

```json
{
  "id": "example-plugin",
  "name": "Example Plugin",
  "version": "0.1.0",
  "entry": "index.js",
  "permissions": ["runtime.read"],
  "capabilities": {
    "workflowActions": [
      {
        "id": "example.run",
        "title": "Example action",
        "inputSchema": {
          "type": "object",
          "properties": {
            "message": { "type": "string", "title": "Message" }
          }
        },
        "outputVariables": {
          "lastMessage": "message"
        }
      }
    ]
  },
  "settings": []
}
```

## Result Format

Return either:

```json
{ "ok": true, "output": {} }
```

or:

```json
{ "ok": false, "stderr": "Human readable error" }
```

Plugin results may also include `variables`, `html`, `text`, `artifacts`, or
`diagnostics` depending on the invoked capability.

## Web Panel UI Helpers

Web panel results can return HTML fragments. NordRelay mounts those fragments
directly into the WebUI, applies the shared WebUI classes, and can run trusted
panel JavaScript when the panel manifest sets `allowClientScript: true`. Use the
`ui` helpers to avoid custom CSS for common panels:

```js
import { ok, runWebPanel, ui } from "@nordbyte/nordrelay-plugin-sdk";

runWebPanel(async ({ context }) => {
  const rows = (context.peers ?? []).map((peer) => ({
    name: peer.name,
    status: peer.health
  }));

  const html = ui.panel(
    "Peer health",
    ui.row([
      ui.metric("Peers", rows.length),
      ui.metric("Node", context.runtime?.nodeName ?? "local")
    ].join("")) +
      ui.table([
        { key: "name", label: "Peer", className: "primary-cell" },
        { label: "Status", render: (row) => ui.badge(row.status ?? "unknown", row.status === "ok" ? "enabled" : "warning") }
      ], rows, { emptyText: "No peers available." })
  );

  return ok(undefined, { panel: { html } });
});
```

For simpler panels you can skip HTML strings and return a declarative panel tree:

```js
import { panelResult, panelUi, runWebPanel } from "@nordbyte/nordrelay-plugin-sdk";

runWebPanel(async () => {
  return panelResult(panelUi.panelNode("Node summary", [
    panelUi.metricNode("CPU", "12%"),
    panelUi.progressNode(12, { status: "ok", title: "CPU usage" })
  ]));
});
```

Interactive panels can add a `panel.script` string. The script runs with an
`api` object in scope:

```js
return ok(undefined, {
  panel: {
    html: `<button data-refresh>Refresh</button>`,
    script: `
      api.root.querySelector('[data-refresh]').onclick = () => api.reload({});
      api.setInterval(() => api.reload({}), 10000);
    `
  }
});
```

Available API methods include `api.reload(input)`, `api.invokeCommand(command,
input)`, `api.jobs.list()`, `api.jobs.start(command, input)`,
`api.jobs.cancel(jobId)`, `api.events.subscribe(eventName, listener)`,
`api.toast(message)`, `api.copyText(value, label)`, `api.setInterval(fn, ms)`,
`api.setTimeout(fn, ms)`, `api.addEventListener(target, type, listener)`, and
`api.onCleanup(fn)`.

Available helpers include `ui.panel`, `ui.item`, `ui.metric`, `ui.progress`,
`ui.table`, `ui.form`, `ui.chart`, `ui.tabs`, `ui.badge`, `ui.chip`,
`ui.button`, `ui.empty`, `ui.loading`, `ui.error`, `ui.callout`,
`ui.codeBlock`, `ui.logView`, `ui.gallery`, and `ui.artifactCard`. Helper text
values are escaped by default; explicit `render` callbacks, panel bodies, and
panel scripts are treated as trusted content.

## Jobs, Events, And Docs

NordRelay exposes plugin command jobs through the host API. Use jobs for update,
export, cleanup, or other long-running tasks where the WebUI should show status,
logs, and final results instead of blocking a panel request.

The SDK exports `NordRelayPluginPanelApi` and `NordRelayPluginJob` types,
`pluginJobBadge(job)` for WebUI fragments, `panelEventsScript(channel)` for the
host event bridge, and `panelJobRunnerScript({ buttonSelector, command })` for a
small standard button-to-job binding.

`generatePluginMarkdown(manifest)` creates a Markdown reference from a plugin
manifest, including permissions, commands, and settings. Official plugins should
keep README capability sections generated from their manifest so CI can detect
documentation drift.

## Collectors

Long-running NordRelay plugin hosts can invoke collector capabilities on a
schedule. Use `runCollector` for capabilities that sample local state, write
history into the plugin data directory, and return a compact status payload.

```js
import { ok, runCollector } from "@nordbyte/nordrelay-plugin-sdk";

runCollector(async ({ collectorId, host }) => {
  host.requirePermission("system.metrics.read");
  return ok({ collectorId, sampled: true });
});
```
