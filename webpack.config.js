const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const info = require('./package.json');

const isProduction = argv => argv.mode === 'production';

module.exports = (env, argv) => ({
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[local]_[hash:base64]',
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[local]_[hash:base64]',
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.png$/,
                use: 'url-loader?mimetype=image/png',
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'assets/',
                    },
                }],
            },
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: 'app/templates/index.html',
            filename: isProduction(argv) ? '../index.html' : 'index.html',
        }),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(info.version),
            ISSUES: JSON.stringify(info.bugs.url),
            REPO: JSON.stringify(info.homepage),
        }),
    ],
});
