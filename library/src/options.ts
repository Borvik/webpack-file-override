import * as chalk from "chalk";
import * as Logger from "./logger";

export type LogLevel = "INFO" | "WARN" | "ERROR";

export enum ColorLevel {
  Disabled = 0,
  Basic = 1,
  Simple = 2, // 256
  True = 3,
}

export interface LogOptions {
  readonly silent: boolean;
  readonly logLevel: LogLevel;
  readonly logInfoToStdOut: boolean;
  readonly colors: ColorLevel;
}

export interface Options extends LogOptions {
  /**
   * Required - need to know which directories to allow override for
   * and where they look for the overrides
   */
  readonly directories: Record<string, string>

  /**
   * Optional - if a source file's extension isn't listed it will
   * look for the _same_ extension in the override directory
   * 
   * if it is listed it will try the acceptable alternative extensions
   * listed here
   */
  readonly extensions: Record<string, string[]>

  /**
   * Supplies a base_dir that helps resolve relative src and target dirs
   */
  readonly context: string;

  /**
   * Allows using typescript during resolve of original file.
   */
  readonly useTypeScript: boolean;
}

type ValidOptions = keyof Options;
const validOptions: ReadonlyArray<ValidOptions> = [
  "directories",
  "extensions",
  "context",
  "useTypeScript",

  "silent",
  "logLevel",
  "logInfoToStdOut",
  "colors",
];

/**
 * Takes raw options from the webpack config,
 * validates them and adds defaults for missing options
 */
export function getOptions(rawOptions: {}): Options {
  validateOptions(rawOptions);

  const options = makeOptions(rawOptions);

  return options;
}

/**
 * Validate the supplied loader options.
 * At present this validates the option names only; in future we may look at validating the values too
 * @param rawOptions
 */
function validateOptions(rawOptions: {}): void {
  const loaderOptionKeys = Object.keys(rawOptions);
  for (let i = 0; i < loaderOptionKeys.length; i++) {
    const option = loaderOptionKeys[i];
    const isUnexpectedOption = (validOptions as ReadonlyArray<string>).indexOf(option) === -1;
    if (isUnexpectedOption) {
      throw new Error(`webpack-file-overrides-plugin was supplied with an unexpected loader option: ${option}
Please take a look at the options you are supplying; the following are valid options:
${validOptions.join(" / ")}
`);
    }
  }

  // setup validation logger
  let logOptions: LogOptions = {
    silent: false,
    logLevel: "WARN",
    logInfoToStdOut: false,
    colors: ColorLevel.Simple,
    ...rawOptions,
  };

  logOptions = {
    ...logOptions,
    logLevel: logOptions.logLevel.toUpperCase() as LogLevel
  };

  const colors = new chalk.Instance({ level: logOptions.colors });
  const log = Logger.makeLogger(logOptions, colors);

  let options = rawOptions as Partial<Options>;

  let dirKeys = Object.keys(options.directories ?? {});
  if (!dirKeys.length) {
    log.logError(`webpack-file-overrides-plugin was not supplied with 'directories'`);
  }
}

function makeOptions(rawOptions: Partial<Options>): Options {
  const options: Options = {
    ...({
      context: process.cwd(),
      directories: {},
      useTypeScript: false,

      silent: false,
      logLevel: "WARN",
      logInfoToStdOut: false,
      colors: ColorLevel.Simple,
    } as Options),
    ...rawOptions
  };

  const options2: Options = {
    ...options,
    logLevel: options.logLevel.toUpperCase() as LogLevel
  };

  return options2;
}