const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
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
        PROJECT_DISPLAY_NAME: JSON.stringify(info['name-display']),
        VERSION: JSON.stringify(info.version),
        ISSUES: JSON.stringify(info.bugs.url),
        REPO: JSON.stringify(info.homepage),
        TARGET: JSON.stringify(TARGET),
    }),
    // https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_generatesw_config
    new GenerateSW({
        swDest: isProduction ? '../service-worker-core.js' : './service-worker-core.js',
        globDirectory: 'public/',
        globPatterns: ['**/*'],
        manifestTransforms: [
            (originalManifest) => {
                const manifest = originalManifest.map(
                    entry => ({
                        ...entry,
                        url: `public/${entry.url}`,
                    }),
                );
                return { manifest };
            },
        ],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        clientsClaim: true,
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
                include: /webWorkers/,
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
