import * as path from 'path';
import * as fs from 'fs';
import * as Logger from "./logger";

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

export function resolveSrcDir(dirPath: string): string | null {
  let srcPath = resolveSymLinkDir(dirPath);
  if (!srcPath) return srcPath;

  const packageFile = path.resolve(srcPath, 'package.json');
  if (!fs.existsSync(packageFile)) return srcPath;

  const pjson = require(packageFile);
  if (!pjson.main) return srcPath;
  const mainFile = path.resolve(srcPath, pjson.main);
  if (fs.existsSync(mainFile)) {
    return path.dirname(mainFile);
  }
  return srcPath;
}

export function resolveSymLinkDir(dirPath: string): string | null {
  if (fs.existsSync(dirPath)) {
    const file = fs.lstatSync(dirPath);
    if (!file.isDirectory() && !file.isSymbolicLink()) {
      return null;
    }
    else if (!file.isSymbolicLink()) {
      return dirPath;
    }
    else {
      let lnk = fs.readlinkSync(dirPath);
      return path.resolve(path.dirname(dirPath), lnk);
    }
  }
  return null;
}

/**
 * Preliminary empty filePath, and existing check has been done - need further refinement - AS A FILE
 * 
 * @param filePath 
 * @param useTypeScript 
 */
function resolveAsFile(filePath: string, useTypeScript: boolean): string | null {
  const extension = moduleFileExtensions
    .find(ext => 
      (useTypeScript || !ext.includes('ts'))
      && fs.existsSync(`${filePath}.${ext}`)
      && fs.lstatSync(`${filePath}.${ext}`).isFile()
    );

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
function resolveAsDir(filePath: string, useTypeScript: boolean, log: Logger.Logger): string | null {
  const packageFile = path.resolve(filePath, 'package.json');
  if (fs.existsSync(packageFile)) {
    const pjson = require(packageFile);
    if (pjson.main) {
      const mainFile = path.resolve(filePath, pjson.main);
      if (fs.existsSync(mainFile)) {
        return resolveAsFile(mainFile, useTypeScript);
      }
      const lastDitchFile = resolveAsFile(mainFile, useTypeScript);
      if (lastDitchFile) return lastDitchFile;
      log.logWarning(`Unable to resolve "main" from package: ${packageFile} (${mainFile}).`);
      return null;
    }
  }

  // no "main" or no "package.json"
  const indexFileNoExt = path.resolve(filePath, 'index');
  return resolveAsFile(indexFileNoExt, useTypeScript);
}

export function resolveFile(filePath: string, useTypeScript: boolean, log: Logger.Logger): string | null {
  if (!filePath) return null;
  
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
  return null;
}

export function resolveFileAltExt(filePath: string, extAlts: Record<string, string[]>): string | null {
  if (!filePath) return null;

  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    return filePath;
  }

  let parsed = path.parse(filePath);
  if (!parsed.ext) return null;

  let ext = parsed.ext.replace(/^\./, '');
  if (!ext) return null;

  if (!extAlts?.[ext]?.length) return null;

  const { base, ...baseParsed } = parsed;
  let extension = extAlts[ext].find(ex => {
    let testPath = path.format({
      ...baseParsed,
      ext: '.' + ex,
    });
    return fs.existsSync(testPath) && fs.lstatSync(testPath).isFile();
  });

  if (extension) {
    return path.format({
      ...baseParsed,
      ext: '.' + extension
    });
  }
  return null;
}