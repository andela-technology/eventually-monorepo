import chalk from "chalk";
import { config, LogLevels } from "./config";

type Color = "red" | "green" | "magenta" | "blue" | "white" | "gray";

export interface Log {
  trace(color: Color, message: string, ...params: any[]): void;
  error(error: Error): void;
  info(color: Color, message: string, ...params: any[]): void;
}

let _log: Log;
export const log = (): Log => {
  if (!_log)
    _log = {
      trace: (
        color: Color,
        message: string,
        trace?: any,
        ...params: any[]
      ): void => {
        if (config().logLevel === LogLevels.trace)
          console.log(
            chalk[color](message),
            chalk.gray(JSON.stringify(trace || {})),
            ...params
          );
      },
      error: (error: Error): void => {
        console.error(error);
      },
      info: (color: Color, message: string, ...params: any[]): void => {
        if (config().logLevel !== LogLevels.error)
          console.info(chalk[color](message), ...params);
      }
    };
  return _log;
};
