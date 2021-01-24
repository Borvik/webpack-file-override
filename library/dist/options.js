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
exports.getOptions = exports.ColorLevel = void 0;
const chalk = __importStar(require("chalk"));
const Logger = __importStar(require("./logger"));
var ColorLevel;
(function (ColorLevel) {
    ColorLevel[ColorLevel["Disabled"] = 0] = "Disabled";
    ColorLevel[ColorLevel["Basic"] = 1] = "Basic";
    ColorLevel[ColorLevel["Simple"] = 2] = "Simple";
    ColorLevel[ColorLevel["True"] = 3] = "True";
})(ColorLevel = exports.ColorLevel || (exports.ColorLevel = {}));
const validOptions = [
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
function getOptions(rawOptions) {
    validateOptions(rawOptions);
    const options = makeOptions(rawOptions);
    return options;
}
exports.getOptions = getOptions;
/**
 * Validate the supplied loader options.
 * At present this validates the option names only; in future we may look at validating the values too
 * @param rawOptions
 */
function validateOptions(rawOptions) {
    var _a;
    const loaderOptionKeys = Object.keys(rawOptions);
    for (let i = 0; i < loaderOptionKeys.length; i++) {
        const option = loaderOptionKeys[i];
        const isUnexpectedOption = validOptions.indexOf(option) === -1;
        if (isUnexpectedOption) {
            throw new Error(`webpack-file-overrides-plugin was supplied with an unexpected loader option: ${option}
Please take a look at the options you are supplying; the following are valid options:
${validOptions.join(" / ")}
`);
        }
    }
    // setup validation logger
    let logOptions = Object.assign({ silent: false, logLevel: "WARN", logInfoToStdOut: false, colors: ColorLevel.Simple }, rawOptions);
    logOptions = Object.assign(Object.assign({}, logOptions), { logLevel: logOptions.logLevel.toUpperCase() });
    const colors = new chalk.Instance({ level: logOptions.colors });
    const log = Logger.makeLogger(logOptions, colors);
    let options = rawOptions;
    let dirKeys = Object.keys((_a = options.directories) !== null && _a !== void 0 ? _a : {});
    if (!dirKeys.length) {
        log.logError(`webpack-file-overrides-plugin was not supplied with 'directories'`);
    }
}
function makeOptions(rawOptions) {
    const options = Object.assign(Object.assign({}, {
        context: process.cwd(),
        directories: {},
        useTypeScript: false,
        silent: false,
        logLevel: "WARN",
        logInfoToStdOut: false,
        colors: ColorLevel.Simple,
    }), rawOptions);
    const options2 = Object.assign(Object.assign({}, options), { logLevel: options.logLevel.toUpperCase() });
    return options2;
}
