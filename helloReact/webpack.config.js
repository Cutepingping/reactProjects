const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const node_modules = path.resolve(__dirname, 'node_modules');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const pxtorem = require('postcss-pxtorem');
const autoprefixer = require('autoprefixer');
const HappyPack = require('happypack');
const lessToJs = require('less-vars-to-js');
// 主题
const app_theme = lessToJs(fs.readFileSync(path.join(__dirname, './src/css/theme.less'), 'utf8'));
const svgDirs = [
  require.resolve('antd').replace(/warn\.js$/, ''), // 1. 属于 antd 内置 svg 文件
  // path.resolve(__dirname, 'src/my-project-svg-foler'),  // 2. 自己私人的 svg 存放目录
];
const dev_stg = (function(e){
  let obj = {
    dev:{
      extractText: false,//是否禁用样式抽离
      chunks: ['common.js', 'index'],//首页需要导入的文件
      devtool: "#eval-source-map",//制定文件格式为最快速文件格式
      debug: true//开启debug模式
    },
    stg:{
      extractText: false,//是否禁用样式抽离
      chunks: ['common.js', 'index','index.css'],//首页需要导入的文件
      devtool: false,//制定文件格式为最小体积文件格式
      debug: false//关闭debug模式
    }
  }
  if(e === 'dev' || e === 'loc'){
    return obj['dev'];
  }else{
    return obj['stg'];
  }
})(process.env.NODE_ENV);
//配置文件
const config = {
  entry: {
    index: './src/index.js',
  },
  output: {
    path: './dist',
    filename: '[name]-v_[chunkhash:8].js',
  },
  module: {
    loaders: [
      {
        test: /\.js|jsx$/,
        loader: 'happypack/loader?id=js',
        exclude: /node_modules/,
        include: __dirname
      },
      {
        test: function test(filePath) {
          return (/\.css$/.test(filePath) && !/\.module\.css$/.test(filePath)
          );
        },
        loader: ExtractTextPlugin.extract('css?sourceMap&-restructuring!' + 'postcss')
      }, 
      {
        test: /\.module\.css$/,
        loader: ExtractTextPlugin.extract('style', "css?sourceMap&-restructuring&modules&localIdentName=[local]___[hash:base64:5]!postcss")
      }, 
      {
        test: function test(filePath) {
          return (/\.less$/.test(filePath) && !/\.module\.less$/.test(filePath)
          );
        },
        loader: ExtractTextPlugin.extract('css?sourceMap!' + 'postcss!' + ('less-loader?{"sourceMap":true,"modifyVars":' + JSON.stringify(app_theme) + '}'))
      }, 
      {
        test: /\.module\.less$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&localIdentName=[local]___[hash:base64:5]!!' + 'postcss!' + ('less-loader?{"sourceMap":true,"modifyVars":' + JSON.stringify(app_theme) + '}'))
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$/i,
        exclude: /node_modules/,
        loader: 'url?limit=8192&name=images/[hash:8].[name].[ext]'
      },
      {
        test: /\.(svg)$/i,
        loader: 'svg-sprite',
        include: svgDirs, // 把 svgDirs 路径下的所有 svg 文件交给 svg-sprite-loader 插件处理
      },
    ],
    noParse: []
  },
  externals: {
  },
  postcss: [
    autoprefixer({
      browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
    }),
    // PC版不需要px转rem
    // pxtorem({
    //   rootValue: 100,
    //   propWhiteList: [],
    // }),
  ],
  resolve: {
    extensions: ['', '.web.js', '.js', '.jsx', '.json', '.css'],
    modulesDirectories: ['node_modules', path.join(__dirname, '../node_modules')],
    alias: {
      'widget': path.join(__dirname, 'src/widget'),
      'utils': path.join(__dirname, 'src/utils'),
      'biz': path.join(__dirname, 'src/biz'),
      'config': path.join(__dirname, 'src/config'),
      'assets': path.join(__dirname, 'src/assets'),
      'pubBiz': path.join(__dirname, 'src/pubBiz'),
      'css': path.join(__dirname, 'src/css'),
    }
  },
  debug: dev_stg.debug,
  devtool: dev_stg.devtool,
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common.js'),
    new webpack.HotModuleReplacementPlugin(),
    // new LodashModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      { from: './src/assets', to: 'assets' },
    ]),
    new webpack.DefinePlugin({
      "ENV": JSON.stringify(process.env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      chunks: dev_stg.chunks,
      // excludeChunks:['common.js','index'],
      showErrors: true,
      W_ENV: process.env.NODE_ENV,
      hash: true,
      template: 'src/index.html',
    }),
    // 样式抽离
    new ExtractTextPlugin("[name].css", {
      disable: dev_stg.extractText,//抽离组件样式
      allChunks: true,
    }),
    // babel转译
    new HappyPack({
      id: 'js',
      threads: 10,
      loaders: [{
        path: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-1'],
          cacheDirectory: false,
          plugins: [
            ["transform-runtime", {
              "polyfill": false,
              "regenerator": true
            }],
            "add-module-exports", // 支持 export default
            "transform-decorators-legacy",
            "transform-class-properties", ["import", { "libraryName": "antd", "style": true }]
          ]
        }
      }]
    })
  ],
  devServer :{
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8007
  }
};
// 支持CSS模块化
// 解析所有的less文件模块化
config.module.loaders.forEach((loader) => {
  if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.less$') > -1) {
    loader.include = /node_modules/
    loader.test = /\.less$/
  }
  if (loader.test.toString() === '/\\.module\\.less$/') {
    loader.exclude = /node_modules/
    loader.test = /\.less$/
  }
  if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.css$') > -1) {
    loader.include = /node_modules/
    loader.test = /\.css$/
  }
  if (loader.test.toString() === '/\\.module\\.css$/') {
    loader.exclude = /node_modules/
    loader.test = /\.css$/
  }
})
const envArray = ['dev', 'loc'];
// 非本地环境，则需要压缩
if (!_.includes(envArray, '' + process.env.NODE_ENV)) {
  config.plugins.push(
    // 压缩插件
    // new webpack.optimize.UglifyJsPlugin({
    //   minimize: true,//开启压缩
    //   output: {
    //     comments: false,  //去掉注释
    //   },
    //   compress: {
    //     warnings: false,
    //   }
    // }),
    new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      uglifyJS:{
        output: {
          comments: false //去掉注释
        },
        compress: {
          warnings: false
        }
      }
    }),
    //引入第三方库
    new webpack.DllReferencePlugin({
      context: __dirname,
      /**
       * 在这里引入 manifest 文件
       */
      manifest: require('./dist/dll/vendor-manifest.json')
    })
  )
}
module.exports = config;