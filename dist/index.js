export function createHost(request) {
  const permissions = new Set(request.permissions ?? []);
  return {
    permissions,
    hasPermission(permission) {
      return permissions.has(permission);
    },
    requirePermission(permission) {
      if (!permissions.has(permission)) {
        throw new Error(`Plugin permission required: ${permission}`);
      }
    },
    getContext(key) {
      return request.context?.[key];
    },
  };
}

export async function readPluginRequest() {
  const raw = await readAllStdin();
  const parsed = raw.trim() ? JSON.parse(raw) : {};
  return normalizeRequest(parsed);
}

export function ok(output, extra = {}) {
  return { ok: true, output, ...extra };
}

export function fail(message, extra = {}) {
  return { ok: false, stderr: message, ...extra };
}

export async function runPlugin(handler) {
  try {
    const request = await readPluginRequest();
    const result = await handler({ ...request, host: createHost(request) });
    writePluginResult(normalizeResult(result));
  } catch (error) {
    writePluginResult(fail(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}

export async function runWorkflowAction(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "workflow-action") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}

export function writePluginResult(result) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

function normalizeRequest(input) {
  const value = isRecord(input) ? input : {};
  return {
    protocolVersion: value.protocolVersion === 1 ? 1 : 1,
    type: typeof value.type === "string" ? value.type : "workflow-action",
    pluginId: typeof value.pluginId === "string" ? value.pluginId : "",
    capabilityId: typeof value.capabilityId === "string" ? value.capabilityId : undefined,
    actionId: typeof value.actionId === "string" ? value.actionId : undefined,
    command: typeof value.command === "string" ? value.command : undefined,
    panelId: typeof value.panelId === "string" ? value.panelId : undefined,
    handlerId: typeof value.handlerId === "string" ? value.handlerId : undefined,
    input: isRecord(value.input) ? value.input : {},
    settings: isRecord(value.settings) ? value.settings : {},
    dataDir: typeof value.dataDir === "string" ? value.dataDir : "",
    permissions: Array.isArray(value.permissions) ? value.permissions.filter((item) => typeof item === "string") : [],
    context: isRecord(value.context) ? value.context : {},
  };
}

function normalizeResult(result) {
  if (isRecord(result) && typeof result.ok === "boolean") {
    return result;
  }
  return ok(result);
}

function readAllStdin() {
  return new Promise((resolve, reject) => {
    process.stdin.setEncoding("utf8");
    let input = "";
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("error", reject);
    process.stdin.on("end", () => resolve(input));
  });
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
