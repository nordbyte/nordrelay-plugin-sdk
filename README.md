# NordRelay Plugin SDK

Small dependency-free helpers and public types for NordRelay plugins.

## Example

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

Plugins receive one JSON request on stdin and must write one JSON result on stdout. Host data in `context` is already filtered by NordRelay based on the permissions declared and approved for the plugin.

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
        "title": "Example action"
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
