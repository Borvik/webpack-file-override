"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackFileOverridesPlugin = void 0;
var plugin_1 = require("./plugin");
Object.defineProperty(exports, "WebpackFileOverridesPlugin", { enumerable: true, get: function () { return plugin_1.WebpackFileOverridesPlugin; } });
const plugin_2 = require("./plugin");
exports.default = plugin_2.WebpackFileOverridesPlugin;
// This is to make it importable in all these ways
// const WebpackFileOverridesPlugin = require('webpack-file-overrides-plugin');
// import WebpackFileOverridesPlugin from "webpack-file-overrides-plugin";
// import { WebpackFileOverridesPlugin } from "webpack-file-overrides-plugin";
const theClass = require("./plugin").WebpackFileOverridesPlugin;
theClass.WebpackFileOverridesPlugin = plugin_2.WebpackFileOverridesPlugin;
theClass.default = plugin_2.WebpackFileOverridesPlugin;
module.exports = theClass;
