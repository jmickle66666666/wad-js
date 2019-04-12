const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
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
    // https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_generatesw_config
    new InjectManifest({
        swSrc: './app/templates/service-worker.js',
        swDest: isProduction ? '../service-worker.js' : './service-worker.js',
        globDirectory: 'public/',
        globPatterns: ['**/*'],
        manifestTransforms: [
            // Basic transformation to remove a certain URL:
            (originalManifest) => {
                console.log({ originalManifest })
                const manifest = originalManifest.map(
                    (entry) => ({
                        ...entry,
                        url: 'public/' + entry.url
                    })
                );
                // Optionally, set warning messages.
                const warnings = [];
                return { manifest, warnings };
            }
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    }),
];

if (!isProduction) {
    plugins.push(new BundleAnalyzerPlugin({
        openAnalyzer: false,
    }));
} else {
    plugins.unshift(new CleanWebpackPlugin());
}

module.exports = () => ({
    output: {
        filename: '[name].[hash].js',
        hashDigestLength: 8,
        publicPath: isProduction ? 'dist/' : '',
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
    devServer: {
        host: 'localhost',
        port: 8080,
    },
});
