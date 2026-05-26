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

## Manifest

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

Web panel results can return HTML fragments. NordRelay wraps those fragments in
the shared plugin panel shell, injects the current light/dark theme, and exposes
the official WebUI classes. Use the `ui` helpers to avoid custom CSS for common
panels:

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

  return ok(undefined, { html });
});
```

Available helpers include `ui.panel`, `ui.item`, `ui.metric`, `ui.progress`,
`ui.table`, `ui.badge`, `ui.chip`, `ui.button`, `ui.empty`, `ui.loading`,
`ui.error`, `ui.callout`, `ui.codeBlock`, `ui.logView`, `ui.gallery`, and
`ui.artifactCard`. Helper text values are escaped by default; explicit `render`
callbacks and panel bodies are treated as trusted HTML.

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
