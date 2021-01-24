"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackFileOverridesPlugin = void 0;
const chalk = __importStar(require("chalk"));
const path = __importStar(require("path"));
const options_1 = require("./options");
const Logger = __importStar(require("./logger"));
const paths_1 = require("./paths");
class WebpackFileOverridesPlugin {
    constructor(rawOptions = {}) {
        this.options = options_1.getOptions(rawOptions);
        const colors = new chalk.Instance({ level: this.options.colors });
        this.log = Logger.makeLogger(this.options, colors);
        const pathContext = this.options.context;
        const srcDirectories = Object.keys(this.options.directories);
        let transformedDirectories = {};
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
    apply(resolver) {
        // The file system only exists when the plugin is in the resolve context. This means it's also properly placed in the resolve.plugins array.
        // If not, we should warn the user that this plugin should be placed in resolve.plugins and not the plugins array of the root config for example.
        // This should hopefully prevent issues like: https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/9
        if (!resolver.fileSystem) {
            this.log.logWarning("webpack-file-overrides-plugin: No file system found on resolver." +
                " Please make sure you've placed the plugin in the correct part of the configuration." +
                " This plugin is a resolver plugin and should be placed in the resolve part of the Webpack configuration.");
            return;
        }
        let target = resolver.ensureHook('resolve');
        resolver
            .getHook('resolve')
            .tapAsync('WebpackFileOverridesPlugin', (req, context, cb) => {
            var _a, _b, _c, _d, _e, _f;
            if (!((_b = (_a = req) === null || _a === void 0 ? void 0 : _a.context) === null || _b === void 0 ? void 0 : _b.issuer) || !req.path || !req.request) {
                cb();
                return;
            }
            const issuer = (_d = (_c = req) === null || _c === void 0 ? void 0 : _c.context) === null || _d === void 0 ? void 0 : _d.issuer;
            const combinedPath = path.resolve(req.path, req.request);
            const actualPath = paths_1.resolveFile(combinedPath, this.options.useTypeScript, this.log);
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
            const targetFile = paths_1.resolveFileAltExt(targetTestFile, this.options.extensions);
            const stackSize = (_f = (_e = context.stack) === null || _e === void 0 ? void 0 : _e.size) !== null && _f !== void 0 ? _f : 0;
            if (!targetFile || stackSize > 1) {
                cb();
                return;
            }
            let resolveObj = {};
            if (issuer === targetFile) {
                this.log.logInfo(`Override file called original: ${targetFile} -> ${actualPath}`);
                resolveObj = Object.assign({}, req, {
                    request: actualPath
                });
            }
            else {
                this.log.logInfo(`Override file found: ${actualPath} -> ${targetFile} in ${issuer}`);
                resolveObj = Object.assign({}, req, {
                    request: targetFile
                });
            }
            return resolver.doResolve(target, resolveObj, null, context, cb);
        });
    }
}
exports.WebpackFileOverridesPlugin = WebpackFileOverridesPlugin;
