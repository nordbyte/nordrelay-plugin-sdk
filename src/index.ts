export type NordRelayPluginRequestType =
  | "workflow-action"
  | "command"
  | "web-panel"
  | "artifact-handler"
  | "diagnostics";

export type NordRelayPluginPermission =
  | "runtime.read"
  | "sessions.read"
  | "activity.read"
  | "artifacts.read"
  | "artifacts.write"
  | "files.read"
  | "files.write"
  | "workflows.read"
  | "peers.read"
  | "diagnostics.read"
  | "settings.read"
  | "network";

export interface NordRelayPluginRuntimeContext {
  version?: string;
  nodeId?: string;
  nodeName?: string;
  platform?: string;
  workspace?: string;
}

export interface NordRelayPluginHostContext {
  runtime?: NordRelayPluginRuntimeContext;
  workflows?: Record<string, unknown>;
  session?: Record<string, unknown> | null;
  sessions?: Array<Record<string, unknown>>;
  artifacts?: Array<Record<string, unknown>>;
  activity?: Array<Record<string, unknown>>;
  peers?: Array<Record<string, unknown>>;
  diagnostics?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface NordRelayPluginRequest<
  Input extends Record<string, unknown> = Record<string, unknown>,
  Settings extends Record<string, unknown> = Record<string, unknown>,
> {
  protocolVersion: 1;
  type: NordRelayPluginRequestType;
  pluginId: string;
  capabilityId?: string;
  actionId?: string;
  command?: string;
  panelId?: string;
  handlerId?: string;
  input: Input;
  settings: Settings;
  dataDir: string;
  permissions: NordRelayPluginPermission[];
  context: NordRelayPluginHostContext;
}

export interface NordRelayPluginResult<Output = unknown> {
  ok: boolean;
  output?: Output;
  stdout?: string;
  stderr?: string;
  variables?: Record<string, string>;
  html?: string;
  text?: string;
  artifacts?: Array<Record<string, unknown>>;
  diagnostics?: Record<string, unknown>;
}

export interface NordRelayPluginHost {
  permissions: Set<string>;
  hasPermission(permission: string): boolean;
  requirePermission(permission: string): void;
  getContext<K extends keyof NordRelayPluginHostContext>(key: K): NordRelayPluginHostContext[K] | undefined;
}

export type NordRelayPluginHandler<
  Input extends Record<string, unknown> = Record<string, unknown>,
  Settings extends Record<string, unknown> = Record<string, unknown>,
  Output = unknown,
> = (request: NordRelayPluginRequest<Input, Settings> & { host: NordRelayPluginHost }) => Promise<NordRelayPluginResult<Output> | Output> | NordRelayPluginResult<Output> | Output;

export function createHost(request: NordRelayPluginRequest): NordRelayPluginHost {
  const permissions = new Set(request.permissions ?? []);
  return {
    permissions,
    hasPermission(permission: string) {
      return permissions.has(permission);
    },
    requirePermission(permission: string) {
      if (!permissions.has(permission)) {
        throw new Error(`Plugin permission required: ${permission}`);
      }
    },
    getContext(key) {
      return request.context?.[key];
    },
  };
}

export async function readPluginRequest(): Promise<NordRelayPluginRequest> {
  const raw = await readAllStdin();
  const parsed = raw.trim() ? JSON.parse(raw) : {};
  return normalizeRequest(parsed);
}

export function ok<Output = unknown>(output?: Output, extra: Partial<NordRelayPluginResult<Output>> = {}): NordRelayPluginResult<Output> {
  return { ok: true, output, ...extra };
}

export function fail(message: string, extra: Partial<NordRelayPluginResult> = {}): NordRelayPluginResult {
  return { ok: false, stderr: message, ...extra };
}

export async function runPlugin(handler: NordRelayPluginHandler): Promise<void> {
  try {
    const request = await readPluginRequest();
    const result = await handler({ ...request, host: createHost(request) });
    writePluginResult(normalizeResult(result));
  } catch (error) {
    writePluginResult(fail(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}

export async function runWorkflowAction(handler: NordRelayPluginHandler): Promise<void> {
  return runPlugin(async (request) => {
    if (request.type !== "workflow-action") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}

export function writePluginResult(result: NordRelayPluginResult): void {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

function normalizeRequest(input: unknown): NordRelayPluginRequest {
  const value = isRecord(input) ? input : {};
  return {
    protocolVersion: value.protocolVersion === 1 ? 1 : 1,
    type: typeof value.type === "string" ? value.type as NordRelayPluginRequestType : "workflow-action",
    pluginId: typeof value.pluginId === "string" ? value.pluginId : "",
    capabilityId: typeof value.capabilityId === "string" ? value.capabilityId : undefined,
    actionId: typeof value.actionId === "string" ? value.actionId : undefined,
    command: typeof value.command === "string" ? value.command : undefined,
    panelId: typeof value.panelId === "string" ? value.panelId : undefined,
    handlerId: typeof value.handlerId === "string" ? value.handlerId : undefined,
    input: isRecord(value.input) ? value.input : {},
    settings: isRecord(value.settings) ? value.settings : {},
    dataDir: typeof value.dataDir === "string" ? value.dataDir : "",
    permissions: Array.isArray(value.permissions) ? value.permissions.filter((item): item is NordRelayPluginPermission => typeof item === "string") : [],
    context: isRecord(value.context) ? value.context as NordRelayPluginHostContext : {},
  };
}

function normalizeResult(result: unknown): NordRelayPluginResult {
  if (isRecord(result) && typeof result.ok === "boolean") {
    return result as unknown as NordRelayPluginResult;
  }
  return ok(result);
}

function readAllStdin(): Promise<string> {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
