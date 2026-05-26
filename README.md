# NordRelay Plugin SDK

Small dependency-free helpers and public types for NordRelay plugins.

NordRelay sends one JSON request to the plugin process on stdin and expects one
JSON result on stdout. The SDK keeps plugin code small while making the request,
permission and result contracts explicit.

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
