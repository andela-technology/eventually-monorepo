import { AppBase } from "./app";
import { singleton } from "./singleton";
import { InMemoryApp } from "./__dev__";

export * from "./app";
export * from "./builder";
export * from "./config";
export * from "./interfaces";
export * from "./log";
export * from "./singleton";
export * from "./types";
export * from "./utils";

export const app = singleton(function app(app?: AppBase) {
  return app || new InMemoryApp();
});
