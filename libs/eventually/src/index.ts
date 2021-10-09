import { AppBase } from "./app";
import { Singleton } from "./utils";
import { InMemoryApp } from "./__dev__";

export * from "./app";
export * from "./config";
export * from "./interfaces";
export * from "./log";
export * from "./types";
export * from "./utils";
export * from "./__dev__";

export const app = Singleton(function app(app?: AppBase) {
  return app || new InMemoryApp();
});
