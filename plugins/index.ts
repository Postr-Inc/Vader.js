// vaderPlugin.d.ts

/** The API object passed to plugin hooks */
export interface VaderAPI {
  /** Run a shell command (string or string[]) and wait for it to finish */
  runCommand(cmd: string | string[]): Promise<void>;

  /** Inject arbitrary HTML into the <head> of generated index.html files */
  injectHTML(content: string): void;

  /** Log a message prefixed with [Vader Plugin] */
  log(msg: string): void;

  /** Get absolute path to the project root */
  getProjectRoot(): string;

  /** Get absolute path to the dist output directory */
  getDistDir(): string;

  /** Get absolute path to the public assets directory */
  getPublicDir(): string;
}

/** Supported plugin hook names */
export type PluginHookName =
  | "onBuildStart"
  | "onBuildFinish"
  | "onWatchStart"
  | "onWatchStop"
  | "onServeStart"
  | "onServeStop"
  | "onFileChange";

/** Interface for a single plugin */
export interface VaderPlugin {
  /** Called before build starts */
  onBuildStart?(api: VaderAPI): Promise<void> | void;

  /** Called after build finishes */
  onBuildFinish?(api: VaderAPI): Promise<void> | void;

  /** Called when watcher starts (dev mode) */
  onWatchStart?(api: VaderAPI): Promise<void> | void;

  /** Called when watcher stops (dev mode) */
  onWatchStop?(api: VaderAPI): Promise<void> | void;

  /** Called when dev server starts */
  onServeStart?(api: VaderAPI): Promise<void> | void;

  /** Called when dev server stops */
  onServeStop?(api: VaderAPI): Promise<void> | void;

  /** Called on file change during watch, with changed file path */
  onFileChange?(api: VaderAPI, filePath: string): Promise<void> | void;
}

/** User config type */
export interface VaderConfig {
  port?: number;
  host_provider?: string;
  plugins?: VaderPlugin[];
}
