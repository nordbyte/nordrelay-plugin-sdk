export type NordRelayPluginRequestType = "workflow-action" | "command" | "web-panel" | "artifact-handler" | "diagnostics";
export type NordRelayPluginPermission = "runtime.read" | "sessions.read" | "activity.read" | "artifacts.read" | "artifacts.write" | "files.read" | "files.write" | "workflows.read" | "peers.read" | "diagnostics.read" | "settings.read" | "network";
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
export interface NordRelayPluginRequest<Input extends Record<string, unknown> = Record<string, unknown>, Settings extends Record<string, unknown> = Record<string, unknown>> {
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
export type NordRelayPluginHandler<Input extends Record<string, unknown> = Record<string, unknown>, Settings extends Record<string, unknown> = Record<string, unknown>, Output = unknown> = (request: NordRelayPluginRequest<Input, Settings> & {
  host: NordRelayPluginHost;
}) => Promise<NordRelayPluginResult<Output> | Output> | NordRelayPluginResult<Output> | Output;
export declare function createHost(request: NordRelayPluginRequest): NordRelayPluginHost;
export declare function readPluginRequest(): Promise<NordRelayPluginRequest>;
export declare function ok<Output = unknown>(output?: Output, extra?: Partial<NordRelayPluginResult<Output>>): NordRelayPluginResult<Output>;
export declare function fail(message: string, extra?: Partial<NordRelayPluginResult>): NordRelayPluginResult;
export declare function runPlugin(handler: NordRelayPluginHandler): Promise<void>;
export declare function runWorkflowAction(handler: NordRelayPluginHandler): Promise<void>;
export declare function writePluginResult(result: NordRelayPluginResult): void;
