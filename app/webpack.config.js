const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  mode: 'development',
  devtool: 'cheap-module-source-map',

  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: true,
  },

  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-svg': 'react-native-svg/src/ReactNativeSVG.web',
    },
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        // Exclude webpack internals + unneeded node_modules, but keep RN packages that ship raw source
        exclude: /node_modules\/(?!(react-native-safe-area-context|@react-native-async-storage|react-native-svg|phosphor-react-native|react-native-web)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            // Let @react-native/babel-preset own all class/private-method transforms
            // to avoid loose-mode conflicts — do NOT add class-properties plugin here
            presets: ['module:@react-native/babel-preset'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|ttf|otf|woff2?)$/,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
