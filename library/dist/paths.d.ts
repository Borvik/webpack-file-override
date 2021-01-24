import * as Logger from "./logger";
export declare function resolveFile(filePath: string, useTypeScript: boolean, log: Logger.Logger): string | null;
export declare function resolveFileAltExt(filePath: string, extAlts: Record<string, string[]>): string | null;
