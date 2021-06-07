/**
 * @file 配置文件
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {createConfig} = require('build-tools');

const isProd = process.env.NODE_ENV === 'production';
module.exports = createConfig({
    entry: {
        home: './src/home.ts',
        frontend: './src/frontend.ts',
        backend: './src/backend.ts',
        index: './src/index.ts'
    },
    output: {
        publicPath: isProd ? './' : './',
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'SanDevtools',
        libraryTarget: 'umd'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public/standalone.html'),
            filename: 'san-devtools.html',
            chunks: ['frontend']
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public/home.html'),
            filename: 'home.ejs',
            chunks: ['home']
        })
    ]
});
