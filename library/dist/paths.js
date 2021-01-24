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
exports.resolveFileAltExt = exports.resolveFile = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const moduleFileExtensions = [
    'web.mjs',
    'mjs',
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
];
/**
 * Preliminary empty filePath, and existing check has been done - need further refinement - AS A FILE
 *
 * @param filePath
 * @param useTypeScript
 */
function resolveAsFile(filePath, useTypeScript) {
    const extension = moduleFileExtensions
        .find(ext => (useTypeScript || !ext.includes('ts'))
        && fs.existsSync(`${filePath}.${ext}`)
        && fs.lstatSync(`${filePath}.${ext}`).isFile());
    if (extension) {
        return `${filePath}.${extension}`;
    }
    return null;
}
/**
 * Attempts to resolve a directory like NodeJS would - does not recurse when "main" is a directory
 * If "main" does not exist - we log an error and continue - allows normal webpack for original file
 * but a plugin override for the file won't work
 *
 * @param filePath
 * @param useTypeScript
 * @param log
 */
function resolveAsDir(filePath, useTypeScript, log) {
    const packageFile = path.resolve(filePath, 'package.json');
    if (fs.existsSync(packageFile)) {
        const pjson = require(packageFile);
        if (pjson.main) {
            const mainFile = path.resolve(filePath, pjson.main);
            if (fs.existsSync(mainFile)) {
                return resolveAsFile(mainFile, useTypeScript);
            }
            log.logWarning(`Unable to resolve "main" from package: ${packageFile}.`);
            return null;
        }
    }
    // no "main" or no "package.json"
    const indexFileNoExt = path.resolve(filePath, 'index');
    return resolveAsFile(indexFileNoExt, useTypeScript);
}
function resolveFile(filePath, useTypeScript, log) {
    if (!filePath)
        return null;
    if (fs.existsSync(filePath)) {
        const file = fs.lstatSync(filePath);
        if (file.isFile())
            return filePath;
        else if (file.isDirectory())
            return resolveAsDir(filePath, useTypeScript, log);
    }
    let parsed = path.parse(filePath);
    if (!parsed.ext) {
        // no extension - try some extensions
        return resolveAsFile(filePath, useTypeScript);
    }
    log.logWarning(`Unable to resolve ${filePath}`);
    return null;
}
exports.resolveFile = resolveFile;
function resolveFileAltExt(filePath, extAlts) {
    var _a;
    if (!filePath)
        return null;
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        return filePath;
    }
    let parsed = path.parse(filePath);
    if (!parsed.ext)
        return null;
    let ext = parsed.ext.replace(/^\./, '');
    if (!ext)
        return null;
    if (!((_a = extAlts === null || extAlts === void 0 ? void 0 : extAlts[ext]) === null || _a === void 0 ? void 0 : _a.length))
        return null;
    let extension = extAlts[ext].find(ex => {
        let testPath = path.format(Object.assign(Object.assign({}, parsed), { ext: '.' + ex }));
        return fs.existsSync(testPath) && fs.lstatSync(testPath).isFile();
    });
    if (extension) {
        return path.format(Object.assign(Object.assign({}, parsed), { ext: '.' + extension }));
    }
    return null;
}
exports.resolveFileAltExt = resolveFileAltExt;
