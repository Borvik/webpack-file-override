const WebpackFileOverridesPlugin = require('@borvik/webpack-file-override');

module.exports = function override(config, _env) {
  config.resolve.plugins.push(new WebpackFileOverridesPlugin({
    logLevel: 'INFO',
    logInfoToStdOut: true,
    useTypeScript: true,
    directories: {
      './src/components': './src/plugins',
    },
    extensions: {
      'js': ['js', 'jsx', 'ts', 'tsx'],
    }
  }));
  return config;
}