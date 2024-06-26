import chalk from "chalk";
import { config } from "./config";
import { Color, Log } from "./interfaces";
import { Environments, LogLevels } from "./types/enums";
import { singleton } from "./singleton";
import { RegistrationError, ValidationError } from "./types/errors";

/** Uncolored and stringified for deployed non-dev envs */
const plain = (
  _: Color,
  message: string,
  details?: any,
  ...params: any[]
): void => {
  console.log(
    JSON.stringify({
      severity: "INFO",
      message: `${message}: ${details}`,
      params
    })
  );
};

const trace = (
  color: Color,
  message: string,
  details?: unknown,
  ...params: unknown[]
): void => {
  console.log(
    chalk[color](message),
    chalk.gray(JSON.stringify(details || {})),
    ...params
  );
};

const info = (
  color: Color,
  message: string,
  details?: string,
  ...params: unknown[]
): void => {
  console.info(chalk[color](message), chalk.gray(details || ""), ...params);
};

const nolog = (): void => {
  return;
};

const testLog = (): Log => ({
  name: "testLog",
  dispose: () => Promise.resolve(),
  trace: config().logLevel === LogLevels.trace ? trace : nolog,
  info: config().logLevel !== LogLevels.error ? info : nolog,
  error: nolog
});

const devLog = (): Log => ({
  name: "devLog",
  dispose: () => Promise.resolve(),
  trace: config().logLevel === LogLevels.trace ? trace : nolog,
  info: config().logLevel !== LogLevels.error ? info : nolog,
  error: (error: unknown): void => {
    if (error instanceof ValidationError || error instanceof RegistrationError)
      console.error(chalk.red(error.name), error.message, error.details);
    else if (error instanceof Error)
      console.error(chalk.red(error.name), error.message, error.stack);
    else console.error(chalk.red(error));
  }
});

const plainLog = (): Log => ({
  name: "plainLog",
  dispose: () => Promise.resolve(),
  trace: config().logLevel === LogLevels.trace ? plain : nolog,
  info: config().logLevel !== LogLevels.error ? plain : nolog,
  error: (error: unknown): void => {
    if (error instanceof ValidationError || error instanceof RegistrationError)
      console.error(
        JSON.stringify({
          severity: "ERROR",
          name: error.name,
          message: error.message,
          details: error.details
        })
      );
    else if (error instanceof Error)
      console.error(JSON.stringify({ severity: "ERROR", ...error }));
    else console.error(error);
  }
});

export const log = singleton(function log() {
  switch (config().env) {
    case Environments.test:
      return testLog();
    case Environments.development:
      return devLog();
    default:
      return plainLog();
  }
});
