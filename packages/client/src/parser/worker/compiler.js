const run = async () => {
  const webpack = await import('webpack')
  const path = await import('path')
  const {default: TerserPlugin} = await import('terser-webpack-plugin')
  const url = await import('url')
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  webpack.default({
    mode: 'production',
    entry: path.join(__dirname, 'parser.js'),
    target: 'webworker',
    output: {
      filename: 'bundle.js',
      path: __dirname,
      library: {
        type: 'module'
      },
      chunkFormat: 'module'
    },
    experiments: {
      outputModule: true
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false
        })
      ]
    }
  }).run()
}

run()