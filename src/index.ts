export type NordRelayPluginRequestType =
  | "workflow-action"
  | "command"
  | "web-panel"
  | "artifact-handler"
  | "diagnostics"
  | "collector";

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
  | "system.metrics.read"
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
  collectorId?: string;
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

export type NordRelayUiStatus = "enabled" | "disabled" | "warning" | "failed" | "planned" | "error" | "latest" | "ok" | "warn";
export type NordRelayUiButtonVariant = "primary" | "secondary" | "danger";
export type NordRelayUiCalloutTone = "default" | "muted" | "warn" | "error";

export interface NordRelayUiButtonOptions {
  variant?: NordRelayUiButtonVariant;
  mini?: boolean;
  className?: string;
  data?: Record<string, unknown>;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
}

export interface NordRelayUiMetricOptions {
  status?: "ok" | "warn" | "error";
  detail?: unknown;
  className?: string;
}

export interface NordRelayUiProgressOptions {
  status?: "ok" | "warn" | "error";
  title?: string;
  className?: string;
}

export interface NordRelayUiPanelOptions {
  className?: string;
  actions?: unknown;
  badge?: { text: unknown; status?: NordRelayUiStatus };
}

export interface NordRelayUiTableColumn<Row extends Record<string, unknown> = Record<string, unknown>> {
  key?: keyof Row | string;
  label: string;
  className?: string;
  render?: (row: Row, index: number) => unknown;
}

export interface NordRelayUiTableOptions {
  className?: string;
  emptyText?: string;
  minWidth?: number | string;
}

export interface NordRelayUiArtifactCard {
  title?: unknown;
  detail?: unknown;
  href?: unknown;
  imageSrc?: unknown;
  alt?: unknown;
  status?: NordRelayUiStatus;
}

export type NordRelayPluginHandler<
  Input extends Record<string, unknown> = Record<string, unknown>,
  Settings extends Record<string, unknown> = Record<string, unknown>,
  Output = unknown,
> = (request: NordRelayPluginRequest<Input, Settings> & { host: NordRelayPluginHost }) => Promise<NordRelayPluginResult<Output> | Output> | NordRelayPluginResult<Output> | Output;

export const ui = {
  escapeHtml,
  attr,
  badge,
  chip,
  button,
  panel,
  item,
  empty,
  loading,
  error,
  callout,
  metric,
  progress,
  table,
  toolbar,
  row,
  codeBlock,
  logView,
  gallery,
  artifactCard,
};

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function attr(value: unknown): string {
  return escapeHtml(value);
}

export function badge(text: unknown, status: NordRelayUiStatus = "disabled"): string {
  return `<span class="badge ${statusClass(status)}">${escapeHtml(text)}</span>`;
}

export function chip(text: unknown, status?: "ok" | "warn" | "error"): string {
  return `<span class="chip${status ? ` ${statusClass(status)}` : ""}">${escapeHtml(text)}</span>`;
}

export function button(label: unknown, options: NordRelayUiButtonOptions = {}): string {
  const classes = classesFor(options.variant === "primary" ? "" : options.variant, options.mini ? "mini-button" : "", options.className);
  const data = dataAttrs(options.data);
  const title = options.title ? ` title="${attr(options.title)}"` : "";
  const disabled = options.disabled ? " disabled" : "";
  const type = options.type ?? "button";
  return `<button type="${attr(type)}"${classes ? ` class="${classes}"` : ""}${title}${disabled}${data}>${escapeHtml(label)}</button>`;
}

export function panel(title: unknown, body: unknown = "", options: NordRelayUiPanelOptions = {}): string {
  const actions = options.actions ? `<div class="ui-actions">${String(options.actions)}</div>` : "";
  const status = options.badge ? badge(options.badge.text, options.badge.status) : "";
  const header = title || actions || status
    ? `<div class="section-header"><h2>${escapeHtml(title)}</h2><div class="row">${status}${actions}</div></div>`
    : "";
  return `<section class="${classesFor("panel", options.className)}">${header}${String(body ?? "")}</section>`;
}

export function item(title: unknown, body: unknown = "", options: NordRelayUiPanelOptions = {}): string {
  const status = options.badge ? badge(options.badge.text, options.badge.status) : "";
  const actions = options.actions ? `<div class="ui-actions">${String(options.actions)}</div>` : "";
  const header = title || status || actions ? `<strong>${escapeHtml(title)}${status}${actions}</strong>` : "";
  return `<div class="${classesFor("item", options.className)}">${header}${String(body ?? "")}</div>`;
}

export function empty(message = "No data available."): string {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

export function loading(message = "Loading..."): string {
  return `<div class="loading-state">${escapeHtml(message)}</div>`;
}

export function error(message: unknown): string {
  return `<div class="error-state">${escapeHtml(message)}</div>`;
}

export function callout(message: unknown, tone: NordRelayUiCalloutTone = "default"): string {
  return `<div class="${classesFor("callout", tone === "default" ? "" : tone)}">${escapeHtml(message)}</div>`;
}

export function metric(label: unknown, value: unknown, options: NordRelayUiMetricOptions = {}): string {
  const detail = options.detail === undefined ? "" : `<small>${escapeHtml(options.detail)}</small>`;
  const status = options.status ? ` data-status="${attr(options.status)}"` : "";
  return `<div class="${classesFor("metric", options.className)}"${status}><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div>${detail}</div>`;
}

export function progress(value: unknown, options: NordRelayUiProgressOptions = {}): string {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const title = options.title ? ` title="${attr(options.title)}"` : "";
  return `<div class="${classesFor("progress", options.className)}"${title}><span class="${classesFor("progress-fill", options.status === "ok" ? "" : options.status)}" style="width:${pct}%"></span></div>`;
}

export function table<Row extends Record<string, unknown>>(columns: NordRelayUiTableColumn<Row>[], rows: Row[], options: NordRelayUiTableOptions = {}): string {
  if (!rows.length) {
    return empty(options.emptyText ?? "No rows.");
  }
  const minWidth = options.minWidth ? ` style="--table-min-width:${typeof options.minWidth === "number" ? `${options.minWidth}px` : attr(options.minWidth)}"` : "";
  const head = columns.map((column) => `<th${column.className ? ` class="${attr(column.className)}"` : ""}>${escapeHtml(column.label)}</th>`).join("");
  const body = rows.map((rowValue, index) => `<tr>${columns.map((column) => tableCell(column, rowValue, index)).join("")}</tr>`).join("");
  return `<div class="data-table-wrap"${minWidth}><table class="${classesFor("data-table", options.className)}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function toolbar(children: unknown): string {
  return `<div class="toolbar">${String(children ?? "")}</div>`;
}

export function row(children: unknown): string {
  return `<div class="row">${String(children ?? "")}</div>`;
}

export function codeBlock(code: unknown, language = ""): string {
  const langClass = language ? ` language-${safeClass(language)}` : "";
  return `<pre class="code-block${langClass}"><code>${escapeHtml(code)}</code></pre>`;
}

export function logView(text: unknown): string {
  return `<pre class="log-view">${escapeHtml(text)}</pre>`;
}

export function gallery(cards: NordRelayUiArtifactCard[]): string {
  if (!cards.length) {
    return empty("No artifacts.");
  }
  return `<div class="gallery">${cards.map((card) => artifactCard(card)).join("")}</div>`;
}

export function artifactCard(card: NordRelayUiArtifactCard): string {
  const image = card.imageSrc ? `<img src="${attr(card.imageSrc)}" alt="${attr(card.alt ?? card.title ?? "")}">` : "";
  const title = card.href ? `<a href="${attr(card.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(card.title ?? card.href)}</a>` : escapeHtml(card.title ?? "Artifact");
  const status = card.status ? badge(card.status, card.status) : "";
  const detail = card.detail ? `<small>${escapeHtml(card.detail)}</small>` : "";
  return `<div class="artifact-card">${image}<strong>${title}${status}</strong>${detail}</div>`;
}

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

export async function runCommand(handler: NordRelayPluginHandler): Promise<void> {
  return runPlugin(async (request) => {
    if (request.type !== "command") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}

export async function runWebPanel(handler: NordRelayPluginHandler): Promise<void> {
  return runPlugin(async (request) => {
    if (request.type !== "web-panel") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}

export async function runDiagnostics(handler: NordRelayPluginHandler): Promise<void> {
  return runPlugin(async (request) => {
    if (request.type !== "diagnostics") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}

export async function runCollector(handler: NordRelayPluginHandler): Promise<void> {
  return runPlugin(async (request) => {
    if (request.type !== "collector") {
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
    collectorId: typeof value.collectorId === "string" ? value.collectorId : undefined,
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

function tableCell<Row extends Record<string, unknown>>(column: NordRelayUiTableColumn<Row>, rowValue: Row, index: number): string {
  const raw = column.render ? column.render(rowValue, index) : rowValue[column.key ?? ""];
  const html = column.render ? String(raw ?? "") : escapeHtml(raw);
  return `<td data-label="${attr(column.label)}"${column.className ? ` class="${attr(column.className)}"` : ""}>${html}</td>`;
}

function dataAttrs(data?: Record<string, unknown>): string {
  if (!data) {
    return "";
  }
  return Object.entries(data)
    .filter(([key, value]) => key && value !== undefined)
    .map(([key, value]) => ` data-${dashCase(key)}="${attr(value)}"`)
    .join("");
}

function dashCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function classesFor(...values: unknown[]): string {
  return values.map((value) => String(value ?? "").trim()).filter(Boolean).map(attr).join(" ");
}

function statusClass(value: unknown): string {
  return safeClass(String(value || "disabled"));
}

function safeClass(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
