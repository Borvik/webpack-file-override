export declare type LogLevel = "INFO" | "WARN" | "ERROR";
export declare enum ColorLevel {
    Disabled = 0,
    Basic = 1,
    Simple = 2,
    True = 3
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
    readonly directories: Record<string, string>;
    /**
     * Optional - if a source file's extension isn't listed it will
     * look for the _same_ extension in the override directory
     *
     * if it is listed it will try the acceptable alternative extensions
     * listed here
     */
    readonly extensions: Record<string, string[]>;
    /**
     * Supplies a base_dir that helps resolve relative src and target dirs
     */
    readonly context: string;
    /**
     * Allows using typescript during resolve of original file.
     */
    readonly useTypeScript: boolean;
}
/**
 * Takes raw options from the webpack config,
 * validates them and adds defaults for missing options
 */
export declare function getOptions(rawOptions: {}): Options;
