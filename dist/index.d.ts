export type NordRelayPluginRequestType = "workflow-action" | "command" | "web-panel" | "artifact-handler" | "diagnostics" | "collector";
export type NordRelayPluginPermission = "runtime.read" | "sessions.read" | "activity.read" | "artifacts.read" | "artifacts.write" | "files.read" | "files.write" | "workflows.read" | "peers.read" | "diagnostics.read" | "settings.read" | "system.metrics.read" | "system.packages.read" | "system.packages.write" | "system.updates.read" | "system.updates.write" | "network";
export type NordRelayPluginTrustLevel = "official" | "verified" | "community" | "local" | "untrusted";
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
    panel?: {
        html?: string;
        script?: string;
        styles?: string;
    };
    html?: string;
    text?: string;
    artifacts?: Array<Record<string, unknown>>;
    diagnostics?: Record<string, unknown>;
}
export interface NordRelayPluginManifest {
    id: string;
    name: string;
    version: string;
    description?: string;
    author?: string;
    homepage?: string;
    repository?: string;
    license?: string;
    nordrelay?: string;
    entry?: string;
    permissions?: NordRelayPluginPermission[];
    capabilities?: {
        commands?: Array<{
            name: string;
            title?: string;
            description?: string;
            permission?: string;
            inputSchema?: Record<string, unknown>;
            timeoutMs?: number;
        }>;
        workflowActions?: Array<{
            id: string;
            title: string;
            description?: string;
            inputSchema?: Record<string, unknown>;
            outputVariables?: Record<string, string>;
            timeoutMs?: number;
        }>;
        webPanels?: Array<{
            id: string;
            title: string;
            description?: string;
            permission?: string;
            inputSchema?: Record<string, unknown>;
            aggregateCommand?: string;
            allowClientScript?: boolean;
            placement?: "plugins" | "monitor" | "nav";
            timeoutMs?: number;
        }>;
        artifactHandlers?: Array<{
            id: string;
            title: string;
            description?: string;
            inputSchema?: Record<string, unknown>;
            timeoutMs?: number;
        }>;
        collectors?: Array<{
            id: string;
            title: string;
            description?: string;
            intervalMs?: number;
            runOnStart?: boolean;
            inputSchema?: Record<string, unknown>;
            timeoutMs?: number;
        }>;
        diagnostics?: boolean;
    };
    settings?: Array<{
        key: string;
        label: string;
        type: "string" | "number" | "boolean" | "secret" | "select";
        description?: string;
        required?: boolean;
        default?: unknown;
        options?: Array<{
            label: string;
            value: string;
        }>;
    }>;
}
export interface NordRelayPluginJob {
    id: string;
    pluginId: string;
    title: string;
    command?: string;
    status: "queued" | "running" | "completed" | "failed" | "cancelled";
    input: Record<string, unknown>;
    logs: Array<{
        timestamp: string;
        level: "info" | "warn" | "error";
        message: string;
    }>;
    progress?: {
        current?: number;
        total?: number;
        label?: string;
    };
    createdAt: string;
    startedAt?: string;
    finishedAt?: string;
}
export interface NordRelayPluginPanelApi {
    id: string;
    root: HTMLElement;
    reload(input?: Record<string, unknown>): Promise<void> | void;
    invokeCommand(command: string, input?: Record<string, unknown>, options?: Record<string, unknown>): Promise<unknown>;
    jobs: {
        list(options?: Record<string, unknown>): Promise<{
            jobs?: NordRelayPluginJob[];
        } | unknown>;
        start(command: string, input?: Record<string, unknown>, options?: Record<string, unknown>): Promise<NordRelayPluginJob | unknown>;
        cancel(jobId: string, options?: Record<string, unknown>): Promise<NordRelayPluginJob | unknown>;
    };
    events: {
        subscribe(eventName: string, listener: (event: unknown) => void): EventSource;
    };
    toast(message: unknown, options?: Record<string, unknown>): void;
    copyText(value: unknown, label?: unknown): void;
    setInterval(fn: () => void, ms: number): number;
    setTimeout(fn: () => void, ms: number): number;
    addEventListener(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    isVisible(): boolean;
    isActivePage(): boolean;
    onCleanup(fn: () => void): void;
    cleanup(): void;
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
    badge?: {
        text: unknown;
        status?: NordRelayUiStatus;
    };
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
export interface NordRelayUiFormField {
    key: string;
    label?: string;
    type?: "string" | "number" | "boolean" | "secret" | "select";
    description?: string;
    value?: unknown;
    options?: Array<{
        label: string;
        value: string;
    }>;
}
export interface NordRelayUiChartSeries {
    label: string;
    values: Array<number | null | undefined>;
    status?: "ok" | "warn" | "error";
}
export type NordRelayPluginHandler<Input extends Record<string, unknown> = Record<string, unknown>, Settings extends Record<string, unknown> = Record<string, unknown>, Output = unknown> = (request: NordRelayPluginRequest<Input, Settings> & {
    host: NordRelayPluginHost;
}) => Promise<NordRelayPluginResult<Output> | Output> | NordRelayPluginResult<Output> | Output;
export declare const ui: {
    escapeHtml: typeof escapeHtml;
    attr: typeof attr;
    badge: typeof badge;
    chip: typeof chip;
    button: typeof button;
    panel: typeof panel;
    item: typeof item;
    empty: typeof empty;
    loading: typeof loading;
    error: typeof error;
    callout: typeof callout;
    metric: typeof metric;
    progress: typeof progress;
    table: typeof table;
    toolbar: typeof toolbar;
    row: typeof row;
    codeBlock: typeof codeBlock;
    logView: typeof logView;
    gallery: typeof gallery;
    artifactCard: typeof artifactCard;
    form: typeof form;
    chart: typeof chart;
    tabs: typeof tabs;
};
export declare function escapeHtml(value: unknown): string;
export declare function attr(value: unknown): string;
export declare function badge(text: unknown, status?: NordRelayUiStatus): string;
export declare function chip(text: unknown, status?: "ok" | "warn" | "error"): string;
export declare function button(label: unknown, options?: NordRelayUiButtonOptions): string;
export declare function panel(title: unknown, body?: unknown, options?: NordRelayUiPanelOptions): string;
export declare function item(title: unknown, body?: unknown, options?: NordRelayUiPanelOptions): string;
export declare function empty(message?: string): string;
export declare function loading(message?: string): string;
export declare function error(message: unknown): string;
export declare function callout(message: unknown, tone?: NordRelayUiCalloutTone): string;
export declare function metric(label: unknown, value: unknown, options?: NordRelayUiMetricOptions): string;
export declare function progress(value: unknown, options?: NordRelayUiProgressOptions): string;
export declare function table<Row extends Record<string, unknown>>(columns: NordRelayUiTableColumn<Row>[], rows: Row[], options?: NordRelayUiTableOptions): string;
export declare function toolbar(children: unknown): string;
export declare function row(children: unknown): string;
export declare function codeBlock(code: unknown, language?: string): string;
export declare function logView(text: unknown): string;
export declare function gallery(cards: NordRelayUiArtifactCard[]): string;
export declare function artifactCard(card: NordRelayUiArtifactCard): string;
export declare function form(fields: NordRelayUiFormField[]): string;
export declare function chart(series: NordRelayUiChartSeries[], options?: {
    height?: number;
    className?: string;
}): string;
export declare function tabs(items: Array<{
    id: string;
    label: unknown;
    active?: boolean;
    data?: Record<string, unknown>;
}>): string;
export declare function definePluginManifest<const Manifest extends NordRelayPluginManifest>(manifest: Manifest): Manifest;
export declare const manifest: {
    define: typeof definePluginManifest;
    command(name: string, title: string, options?: Record<string, unknown>): {
        name: string;
        title: string;
    };
    workflowAction(id: string, title: string, options?: Record<string, unknown>): {
        id: string;
        title: string;
    };
    webPanel(id: string, title: string, options?: Record<string, unknown>): {
        id: string;
        title: string;
    };
    collector(id: string, title: string, options?: Record<string, unknown>): {
        id: string;
        title: string;
    };
    setting(key: string, label: string, type: NordRelayUiFormField["type"], options?: Record<string, unknown>): {
        key: string;
        label: string;
        type: "string" | "number" | "boolean" | "secret" | "select";
    };
};
export declare function generatePluginMarkdown(plugin: NordRelayPluginManifest): string;
export declare function panelEventsScript(channel?: string): string;
export declare function panelJobRunnerScript(options: {
    buttonSelector: string;
    command: string;
    resultSelector?: string;
    input?: Record<string, unknown>;
}): string;
export declare function pluginJobBadge(job: NordRelayPluginJob): string;
export declare function createHost(request: NordRelayPluginRequest): NordRelayPluginHost;
export declare function readPluginRequest(): Promise<NordRelayPluginRequest>;
export declare function ok<Output = unknown>(output?: Output, extra?: Partial<NordRelayPluginResult<Output>>): NordRelayPluginResult<Output>;
export declare function fail(message: string, extra?: Partial<NordRelayPluginResult>): NordRelayPluginResult;
export declare function runPlugin(handler: NordRelayPluginHandler): Promise<void>;
export declare function runWorkflowAction(handler: NordRelayPluginHandler): Promise<void>;
export declare function runCommand(handler: NordRelayPluginHandler): Promise<void>;
export declare function runWebPanel(handler: NordRelayPluginHandler): Promise<void>;
export declare function runDiagnostics(handler: NordRelayPluginHandler): Promise<void>;
export declare function runCollector(handler: NordRelayPluginHandler): Promise<void>;
export declare function writePluginResult(result: NordRelayPluginResult): void;
