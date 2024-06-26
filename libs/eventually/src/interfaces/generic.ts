export type Color =
  | "red"
  | "green"
  | "magenta"
  | "blue"
  | "white"
  | "gray"
  | "bgRed"
  | "bgGreen"
  | "bgMagenta"
  | "bgBlue"
  | "bgWhite";

/**
 * Resource disposer function
 */
export type Disposer = () => Promise<void>;

/**
 * Resource Seeder function
 */
export type Seeder = () => Promise<void>;

/**
 * Disposable resources
 */
export interface Disposable {
  readonly name: string;
  dispose: Disposer;
}

/**
 * Seedable resources (i.e. to initialize or run store migrations)
 */
export interface Seedable {
  seed: Seeder;
}

/**
 * Logger
 */
export interface Log extends Disposable {
  trace(color: Color, message: string, ...params: any[]): void;
  info(color: Color, message: string, ...params: any[]): void;
  error(error: unknown): void;
}
