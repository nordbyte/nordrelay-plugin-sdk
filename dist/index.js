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

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function attr(value) {
  return escapeHtml(value);
}

export function badge(text, status = "disabled") {
  return `<span class="badge ${statusClass(status)}">${escapeHtml(text)}</span>`;
}

export function chip(text, status) {
  return `<span class="chip${status ? ` ${statusClass(status)}` : ""}">${escapeHtml(text)}</span>`;
}

export function button(label, options = {}) {
  const classes = classesFor(options.variant === "primary" ? "" : options.variant, options.mini ? "mini-button" : "", options.className);
  const data = dataAttrs(options.data);
  const title = options.title ? ` title="${attr(options.title)}"` : "";
  const disabled = options.disabled ? " disabled" : "";
  const type = options.type ?? "button";
  return `<button type="${attr(type)}"${classes ? ` class="${classes}"` : ""}${title}${disabled}${data}>${escapeHtml(label)}</button>`;
}

export function panel(title, body = "", options = {}) {
  const actions = options.actions ? `<div class="ui-actions">${String(options.actions)}</div>` : "";
  const status = options.badge ? badge(options.badge.text, options.badge.status) : "";
  const header = title || actions || status
    ? `<div class="section-header"><h2>${escapeHtml(title)}</h2><div class="row">${status}${actions}</div></div>`
    : "";
  return `<section class="${classesFor("panel", options.className)}">${header}${String(body ?? "")}</section>`;
}

export function item(title, body = "", options = {}) {
  const status = options.badge ? badge(options.badge.text, options.badge.status) : "";
  const actions = options.actions ? `<div class="ui-actions">${String(options.actions)}</div>` : "";
  const header = title || status || actions ? `<strong>${escapeHtml(title)}${status}${actions}</strong>` : "";
  return `<div class="${classesFor("item", options.className)}">${header}${String(body ?? "")}</div>`;
}

export function empty(message = "No data available.") {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

export function loading(message = "Loading...") {
  return `<div class="loading-state">${escapeHtml(message)}</div>`;
}

export function error(message) {
  return `<div class="error-state">${escapeHtml(message)}</div>`;
}

export function callout(message, tone = "default") {
  return `<div class="${classesFor("callout", tone === "default" ? "" : tone)}">${escapeHtml(message)}</div>`;
}

export function metric(label, value, options = {}) {
  const detail = options.detail === undefined ? "" : `<small>${escapeHtml(options.detail)}</small>`;
  const status = options.status ? ` data-status="${attr(options.status)}"` : "";
  return `<div class="${classesFor("metric", options.className)}"${status}><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div>${detail}</div>`;
}

export function progress(value, options = {}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const title = options.title ? ` title="${attr(options.title)}"` : "";
  return `<div class="${classesFor("progress", options.className)}"${title}><span class="${classesFor("progress-fill", options.status === "ok" ? "" : options.status)}" style="width:${pct}%"></span></div>`;
}

export function table(columns, rows, options = {}) {
  if (!rows.length) {
    return empty(options.emptyText ?? "No rows.");
  }
  const minWidth = options.minWidth ? ` style="--table-min-width:${typeof options.minWidth === "number" ? `${options.minWidth}px` : attr(options.minWidth)}"` : "";
  const head = columns.map((column) => `<th${column.className ? ` class="${attr(column.className)}"` : ""}>${escapeHtml(column.label)}</th>`).join("");
  const body = rows.map((rowValue, index) => `<tr>${columns.map((column) => tableCell(column, rowValue, index)).join("")}</tr>`).join("");
  return `<div class="data-table-wrap"${minWidth}><table class="${classesFor("data-table", options.className)}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function toolbar(children) {
  return `<div class="toolbar">${String(children ?? "")}</div>`;
}

export function row(children) {
  return `<div class="row">${String(children ?? "")}</div>`;
}

export function codeBlock(code, language = "") {
  const langClass = language ? ` language-${safeClass(language)}` : "";
  return `<pre class="code-block${langClass}"><code>${escapeHtml(code)}</code></pre>`;
}

export function logView(text) {
  return `<pre class="log-view">${escapeHtml(text)}</pre>`;
}

export function gallery(cards) {
  if (!cards.length) {
    return empty("No artifacts.");
  }
  return `<div class="gallery">${cards.map((card) => artifactCard(card)).join("")}</div>`;
}

export function artifactCard(card) {
  const image = card.imageSrc ? `<img src="${attr(card.imageSrc)}" alt="${attr(card.alt ?? card.title ?? "")}">` : "";
  const title = card.href ? `<a href="${attr(card.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(card.title ?? card.href)}</a>` : escapeHtml(card.title ?? "Artifact");
  const status = card.status ? badge(card.status, card.status) : "";
  const detail = card.detail ? `<small>${escapeHtml(card.detail)}</small>` : "";
  return `<div class="artifact-card">${image}<strong>${title}${status}</strong>${detail}</div>`;
}

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

export async function runCommand(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "command") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}

export async function runWebPanel(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "web-panel") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}

export async function runDiagnostics(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "diagnostics") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}

export async function runCollector(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "collector") {
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
    collectorId: typeof value.collectorId === "string" ? value.collectorId : undefined,
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

function tableCell(column, rowValue, index) {
  const raw = column.render ? column.render(rowValue, index) : rowValue[column.key ?? ""];
  const html = column.render ? String(raw ?? "") : escapeHtml(raw);
  return `<td data-label="${attr(column.label)}"${column.className ? ` class="${attr(column.className)}"` : ""}>${html}</td>`;
}

function dataAttrs(data) {
  if (!data) {
    return "";
  }
  return Object.entries(data)
    .filter(([key, value]) => key && value !== undefined)
    .map(([key, value]) => ` data-${dashCase(key)}="${attr(value)}"`)
    .join("");
}

function dashCase(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function classesFor(...values) {
  return values.map((value) => String(value ?? "").trim()).filter(Boolean).map(attr).join(" ");
}

function statusClass(value) {
  return safeClass(String(value || "disabled"));
}

function safeClass(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
