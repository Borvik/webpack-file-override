import { Options } from "./options";
import * as Logger from "./logger";
import { Resolver, ResolverPlugin } from "./types";
export declare class WebpackFileOverridesPlugin implements ResolverPlugin {
    log: Logger.Logger;
    options: Options;
    overridePaths: Record<string, string>;
    overrideSrcPaths: string[];
    constructor(rawOptions?: Partial<Options>);
    apply(resolver: Resolver): void;
}
