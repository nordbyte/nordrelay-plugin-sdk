const ui = {
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
  form,
  chart,
  tabs
};
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function attr(value) {
  return escapeHtml(value);
}
function badge(text, status = "disabled") {
  return `<span class="badge ${statusClass(status)}">${escapeHtml(text)}</span>`;
}
function chip(text, status) {
  return `<span class="chip${status ? ` ${statusClass(status)}` : ""}">${escapeHtml(text)}</span>`;
}
function button(label, options = {}) {
  const classes = classesFor(options.variant === "primary" ? "" : options.variant, options.mini ? "mini-button" : "", options.className);
  const data = dataAttrs(options.data);
  const title = options.title ? ` title="${attr(options.title)}"` : "";
  const disabled = options.disabled ? " disabled" : "";
  const type = options.type ?? "button";
  return `<button type="${attr(type)}"${classes ? ` class="${classes}"` : ""}${title}${disabled}${data}>${escapeHtml(label)}</button>`;
}
function panel(title, body = "", options = {}) {
  const actions = options.actions ? `<div class="ui-actions">${String(options.actions)}</div>` : "";
  const status = options.badge ? badge(options.badge.text, options.badge.status) : "";
  const header = title || actions || status ? `<div class="section-header"><h2>${escapeHtml(title)}</h2><div class="row">${status}${actions}</div></div>` : "";
  return `<section class="${classesFor("panel", options.className)}">${header}${String(body ?? "")}</section>`;
}
function item(title, body = "", options = {}) {
  const status = options.badge ? badge(options.badge.text, options.badge.status) : "";
  const actions = options.actions ? `<div class="ui-actions">${String(options.actions)}</div>` : "";
  const header = title || status || actions ? `<strong>${escapeHtml(title)}${status}${actions}</strong>` : "";
  return `<div class="${classesFor("item", options.className)}">${header}${String(body ?? "")}</div>`;
}
function empty(message = "No data available.") {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}
function loading(message = "Loading...") {
  return `<div class="loading-state">${escapeHtml(message)}</div>`;
}
function error(message) {
  return `<div class="error-state">${escapeHtml(message)}</div>`;
}
function callout(message, tone = "default") {
  return `<div class="${classesFor("callout", tone === "default" ? "" : tone)}">${escapeHtml(message)}</div>`;
}
function metric(label, value, options = {}) {
  const detail = options.detail === void 0 ? "" : `<small>${escapeHtml(options.detail)}</small>`;
  const status = options.status ? ` data-status="${attr(options.status)}"` : "";
  return `<div class="${classesFor("metric", options.className)}"${status}><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div>${detail}</div>`;
}
function progress(value, options = {}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const title = options.title ? ` title="${attr(options.title)}"` : "";
  return `<div class="${classesFor("progress", options.className)}"${title}><span class="${classesFor("progress-fill", options.status === "ok" ? "" : options.status)}" style="width:${pct}%"></span></div>`;
}
function table(columns, rows, options = {}) {
  if (!rows.length) {
    return empty(options.emptyText ?? "No rows.");
  }
  const minWidth = options.minWidth ? ` style="--table-min-width:${typeof options.minWidth === "number" ? `${options.minWidth}px` : attr(options.minWidth)}"` : "";
  const head = columns.map((column) => `<th${column.className ? ` class="${attr(column.className)}"` : ""}>${escapeHtml(column.label)}</th>`).join("");
  const body = rows.map((rowValue, index) => `<tr>${columns.map((column) => tableCell(column, rowValue, index)).join("")}</tr>`).join("");
  return `<div class="data-table-wrap"${minWidth}><table class="${classesFor("data-table", options.className)}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function toolbar(children) {
  return `<div class="toolbar">${String(children ?? "")}</div>`;
}
function row(children) {
  return `<div class="row">${String(children ?? "")}</div>`;
}
function codeBlock(code, language = "") {
  const langClass = language ? ` language-${safeClass(language)}` : "";
  return `<pre class="code-block${langClass}"><code>${escapeHtml(code)}</code></pre>`;
}
function logView(text) {
  return `<pre class="log-view">${escapeHtml(text)}</pre>`;
}
function gallery(cards) {
  if (!cards.length) {
    return empty("No artifacts.");
  }
  return `<div class="gallery">${cards.map((card) => artifactCard(card)).join("")}</div>`;
}
function artifactCard(card) {
  const image = card.imageSrc ? `<img src="${attr(card.imageSrc)}" alt="${attr(card.alt ?? card.title ?? "")}">` : "";
  const title = card.href ? `<a href="${attr(card.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(card.title ?? card.href)}</a>` : escapeHtml(card.title ?? "Artifact");
  const status = card.status ? badge(card.status, card.status) : "";
  const detail = card.detail ? `<small>${escapeHtml(card.detail)}</small>` : "";
  return `<div class="artifact-card">${image}<strong>${title}${status}</strong>${detail}</div>`;
}
function form(fields) {
  if (!fields.length) return empty("No form fields.");
  return `<div class="form-grid">${fields.map((field) => formField(field)).join("")}</div>`;
}
function chart(series, options = {}) {
  if (!series.length) return empty("No chart data.");
  const height = Math.max(80, Number(options.height) || 180);
  const max = Math.max(1, ...series.flatMap((item2) => item2.values.map((value) => Number(value) || 0)));
  const rows = series.map((item2, seriesIndex) => {
    const points = item2.values.map((value, index) => {
      const x = item2.values.length <= 1 ? 0 : index / (item2.values.length - 1) * 100;
      const y = 100 - (Number(value) || 0) / max * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
    return `<polyline class="chart-line ${statusClass(item2.status ?? seriesIndex)}" points="${points}"></polyline>`;
  }).join("");
  const legend = `<div class="chart-legend">${series.map((item2) => `<span>${escapeHtml(item2.label)}</span>`).join("")}</div>`;
  return `<div class="${classesFor("metrics-chart", options.className)}" style="--chart-height:${height}px"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${rows}</svg>${legend}</div>`;
}
function tabs(items) {
  return `<div class="section-tabs" role="tablist">${items.map((item2) => {
    const active = item2.active ? " active" : "";
    return `<button type="button" role="tab" class="${active.trim()}" aria-selected="${item2.active ? "true" : "false"}" data-tab-id="${attr(item2.id)}"${dataAttrs(item2.data)}>${escapeHtml(item2.label)}</button>`;
  }).join("")}</div>`;
}
function definePluginManifest(manifest2) {
  validateManifestBasics(manifest2);
  return manifest2;
}
const manifest = {
  define: definePluginManifest,
  command(name, title, options = {}) {
    return { name, title, ...options };
  },
  workflowAction(id, title, options = {}) {
    return { id, title, ...options };
  },
  webPanel(id, title, options = {}) {
    return { id, title, ...options };
  },
  collector(id, title, options = {}) {
    return { id, title, ...options };
  },
  setting(key, label, type, options = {}) {
    return { key, label, type, ...options };
  }
};
function generatePluginMarkdown(plugin) {
  const capabilities = plugin.capabilities ?? {};
  const commandRows = (capabilities.commands ?? []).map((item2) => `| \`${item2.name}\` | ${item2.title ?? ""} | ${item2.permission ?? ""} |`);
  const settingsRows = (plugin.settings ?? []).map((item2) => `| \`${item2.key}\` | ${item2.type} | ${item2.default === void 0 ? "" : `\`${String(item2.default)}\``} | ${item2.description ?? ""} |`);
  return [
    `# ${plugin.name}`,
    "",
    plugin.description ?? "",
    "",
    "## Permissions",
    "",
    ...plugin.permissions?.length ? plugin.permissions.map((permission) => `- \`${permission}\``) : ["No permissions declared."],
    "",
    "## Commands",
    "",
    commandRows.length ? "| Command | Title | Permission |\n| --- | --- | --- |\n" + commandRows.join("\n") : "No commands declared.",
    "",
    "## Settings",
    "",
    settingsRows.length ? "| Setting | Type | Default | Description |\n| --- | --- | --- | --- |\n" + settingsRows.join("\n") : "No settings declared.",
    ""
  ].join("\n");
}
function panelEventsScript(channel = "jobs") {
  return `api.events?.subscribe?.(${JSON.stringify(channel)}, event => api.toast?.(event?.message || event?.type || 'Plugin event'));`;
}
function panelJobRunnerScript(options) {
  const resultSelector = options.resultSelector ?? "[data-plugin-job-result]";
  return [
    `const jobButton = api.root.querySelector(${JSON.stringify(options.buttonSelector)});`,
    `const jobResult = api.root.querySelector(${JSON.stringify(resultSelector)});`,
    "if (jobButton) {",
    "  jobButton.addEventListener('click', async () => {",
    "    jobButton.disabled = true;",
    `    const job = await api.jobs.start(${JSON.stringify(options.command)}, ${JSON.stringify(options.input ?? {})});`,
    "    if (jobResult) jobResult.textContent = JSON.stringify(job, null, 2);",
    "    jobButton.disabled = false;",
    "  });",
    "}"
  ].join("\n");
}
function pluginJobBadge(job) {
  const status = job.status === "completed" ? "enabled" : job.status === "failed" ? "failed" : job.status === "running" ? "warning" : "disabled";
  return badge(job.status, status);
}
function createHost(request) {
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
    }
  };
}
async function readPluginRequest() {
  const raw = await readAllStdin();
  const parsed = raw.trim() ? JSON.parse(raw) : {};
  return normalizeRequest(parsed);
}
function ok(output, extra = {}) {
  return { ok: true, output, ...extra };
}
function fail(message, extra = {}) {
  return { ok: false, stderr: message, ...extra };
}
async function runPlugin(handler) {
  try {
    const request = await readPluginRequest();
    const result = await handler({ ...request, host: createHost(request) });
    writePluginResult(normalizeResult(result));
  } catch (error2) {
    writePluginResult(fail(error2 instanceof Error ? error2.message : String(error2)));
    process.exitCode = 1;
  }
}
async function runWorkflowAction(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "workflow-action") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}
async function runCommand(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "command") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}
async function runWebPanel(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "web-panel") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}
async function runDiagnostics(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "diagnostics") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}
async function runCollector(handler) {
  return runPlugin(async (request) => {
    if (request.type !== "collector") {
      throw new Error(`Unsupported plugin request type: ${request.type}`);
    }
    return handler(request);
  });
}
function writePluginResult(result) {
  process.stdout.write(`${JSON.stringify(result)}
`);
}
function normalizeRequest(input) {
  const value = isRecord(input) ? input : {};
  return {
    protocolVersion: value.protocolVersion === 1 ? 1 : 1,
    type: typeof value.type === "string" ? value.type : "workflow-action",
    pluginId: typeof value.pluginId === "string" ? value.pluginId : "",
    capabilityId: typeof value.capabilityId === "string" ? value.capabilityId : void 0,
    actionId: typeof value.actionId === "string" ? value.actionId : void 0,
    command: typeof value.command === "string" ? value.command : void 0,
    panelId: typeof value.panelId === "string" ? value.panelId : void 0,
    handlerId: typeof value.handlerId === "string" ? value.handlerId : void 0,
    collectorId: typeof value.collectorId === "string" ? value.collectorId : void 0,
    input: isRecord(value.input) ? value.input : {},
    settings: isRecord(value.settings) ? value.settings : {},
    dataDir: typeof value.dataDir === "string" ? value.dataDir : "",
    permissions: Array.isArray(value.permissions) ? value.permissions.filter((item2) => typeof item2 === "string") : [],
    context: isRecord(value.context) ? value.context : {}
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
function formField(field) {
  const label = escapeHtml(field.label ?? field.key);
  const description = field.description ? `<small>${escapeHtml(field.description)}</small>` : "";
  if (field.type === "boolean") {
    return `<label class="checkbox"><input type="checkbox" name="${attr(field.key)}"${field.value ? " checked" : ""}> <span>${label}</span></label>`;
  }
  if (field.type === "select") {
    const options = (field.options ?? []).map((option) => `<option value="${attr(option.value)}"${String(field.value ?? "") === String(option.value) ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("");
    return `<label><span>${label}</span><select name="${attr(field.key)}">${options}</select>${description}</label>`;
  }
  const type = field.type === "number" ? "number" : field.type === "secret" ? "password" : "text";
  return `<label><span>${label}</span><input type="${type}" name="${attr(field.key)}" value="${attr(field.value ?? "")}">${description}</label>`;
}
function validateManifestBasics(manifest2) {
  if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(manifest2.id)) {
    throw new Error("Plugin manifest id is invalid.");
  }
  if (!manifest2.name || !manifest2.version) {
    throw new Error("Plugin manifest name and version are required.");
  }
}
function dataAttrs(data) {
  if (!data) {
    return "";
  }
  return Object.entries(data).filter(([key, value]) => key && value !== void 0).map(([key, value]) => ` data-${dashCase(key)}="${attr(value)}"`).join("");
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
export {
  artifactCard,
  attr,
  badge,
  button,
  callout,
  chart,
  chip,
  codeBlock,
  createHost,
  definePluginManifest,
  empty,
  error,
  escapeHtml,
  fail,
  form,
  gallery,
  generatePluginMarkdown,
  item,
  loading,
  logView,
  manifest,
  metric,
  ok,
  panel,
  panelEventsScript,
  panelJobRunnerScript,
  pluginJobBadge,
  progress,
  readPluginRequest,
  row,
  runCollector,
  runCommand,
  runDiagnostics,
  runPlugin,
  runWebPanel,
  runWorkflowAction,
  table,
  tabs,
  toolbar,
  ui,
  writePluginResult
};
