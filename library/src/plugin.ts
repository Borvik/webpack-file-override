import * as chalk from "chalk";
import * as path from "path";
import { Options, getOptions } from "./options";
import * as Logger from "./logger";
import { Resolver, ResolverPlugin } from "./types";
import { resolveFile, resolveFileAltExt } from "./paths";

export class WebpackFileOverridesPlugin implements ResolverPlugin {
  log: Logger.Logger;
  options: Options;
  overridePaths: Record<string, string>;
  overrideSrcPaths: string[];

  constructor(rawOptions: Partial<Options> = {}) {
    this.options = getOptions(rawOptions);

    const colors = new chalk.Instance({ level: this.options.colors });
    this.log = Logger.makeLogger(this.options, colors);

    const pathContext = this.options.context;
    const srcDirectories: string[] = Object.keys(this.options.directories);
    let transformedDirectories: Record<string, string> = {};
    let l = srcDirectories.length;
    for (let i = 0; i < l; i++) {
      let fullSrc = path.resolve(pathContext, srcDirectories[i]);
      let fullTarget = path.resolve(pathContext, this.options.directories[srcDirectories[i]]);
      transformedDirectories[fullSrc] = fullTarget;
    }
    this.overridePaths = transformedDirectories;
    this.overrideSrcPaths = Object.keys(transformedDirectories);
    this.log.logInfo(`webpack-file-overrides-plugin: Initialized`);
  }

  apply(resolver: Resolver): void {
    // The file system only exists when the plugin is in the resolve context. This means it's also properly placed in the resolve.plugins array.
    // If not, we should warn the user that this plugin should be placed in resolve.plugins and not the plugins array of the root config for example.
    // This should hopefully prevent issues like: https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/9
    if (!resolver.fileSystem) {
      this.log.logWarning(
        "webpack-file-overrides-plugin: No file system found on resolver." +
          " Please make sure you've placed the plugin in the correct part of the configuration." +
          " This plugin is a resolver plugin and should be placed in the resolve part of the Webpack configuration."
      );
      return;
    }

    let target = resolver.ensureHook('resolve');
    resolver
      .getHook('resolve')
      .tapAsync('WebpackFileOverridesPlugin', (req, context, cb) => {
        if (!(req as any)?.context?.issuer || !req.path || !req.request) {
          cb();
          return;
        }

        const issuer: string = (req as any)?.context?.issuer;
        const combinedPath = path.resolve(req.path, req.request);
        const actualPath = resolveFile(combinedPath, this.options.useTypeScript, this.log);
        if (!actualPath) {
          cb();
          return;
        }

        const srcParentDir = this.overrideSrcPaths.find(p => {
          const relPath = path.relative(p, actualPath);
          return relPath && !relPath.startsWith('..') && !path.isAbsolute(relPath);
        });

        if (!srcParentDir) {
          cb();
          return;
        }
        
        const srcRelativePath = path.relative(srcParentDir, actualPath);
        const targetTestFile = path.resolve(this.overridePaths[srcParentDir], srcRelativePath);
        const targetFile = resolveFileAltExt(targetTestFile, this.options.extensions);

        const stackSize = context.stack?.size ?? 0;
        if (!targetFile || stackSize > 1) {
          cb();
          return;
        }

        let resolveObj: {} = {};
        if (issuer === targetFile) {
          this.log.logInfo(`Override file called original: ${targetFile} -> ${actualPath}`);
          resolveObj = Object.assign({}, req, {
            request: actualPath
          });
        } else {
          this.log.logInfo(`Override file found: ${actualPath} -> ${targetFile} in ${issuer}`);
          resolveObj = Object.assign({}, req, {
            request: targetFile
          });
        }
        
        return resolver.doResolve(target, resolveObj, null, context, cb);
      });
  }
}

