export { WebpackFileOverridesPlugin } from "./plugin";
import { WebpackFileOverridesPlugin } from "./plugin";

export default WebpackFileOverridesPlugin;

// This is to make it importable in all these ways
// const WebpackFileOverridesPlugin = require('webpack-file-overrides-plugin');
// import WebpackFileOverridesPlugin from "webpack-file-overrides-plugin";
// import { WebpackFileOverridesPlugin } from "webpack-file-overrides-plugin";
const theClass = require("./plugin").WebpackFileOverridesPlugin;
theClass.WebpackFileOverridesPlugin = WebpackFileOverridesPlugin;
theClass.default = WebpackFileOverridesPlugin;
module.exports = theClass;