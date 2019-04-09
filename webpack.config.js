const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const info = require('./package.json');

const { TARGET } = process.env;
const isProduction = TARGET === 'build';
console.log({ TARGET });

const plugins = [
    new HtmlWebPackPlugin({
        template: isProduction ? 'app/templates/index.html' : 'app/templates/index-without-ga.html',
        filename: isProduction ? '../index.html' : 'index.html',
    }),
    new webpack.DefinePlugin({
        PROJECT: JSON.stringify(info.name),
        VERSION: JSON.stringify(info.version),
        ISSUES: JSON.stringify(info.bugs.url),
        REPO: JSON.stringify(info.homepage),
        TARGET: JSON.stringify(TARGET),
    }),
];

if (isProduction) {
    plugins.unshift(new CleanWebpackPlugin());
} else {
    plugins.push(new BundleAnalyzerPlugin({
        openAnalyzer: false,
    }));
}

module.exports = () => ({
    output: {
        filename: '[name].[hash].js',
        hashDigestLength: 8,
    },
    optimization: {
        minimize: true,
    },
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
            {
                test: /\.js$/,
                include: /workers/,
                use: [{
                    loader: 'worker-loader',
                    options: {
                        name: '[name].[hash].js',
                        publicPath: isProduction ? 'dist/' : '',
                    },
                }],
            },
        ],
    },
    plugins,
    devtool: 'cheap-module-eval-source-map',
});
