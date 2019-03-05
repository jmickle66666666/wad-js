const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");

const isProduction = (argv) => argv.mode === 'production' ? true : false;

module.exports = (env, argv) => ({
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                   loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: "[local]_[hash:base64]",
                            sourceMap: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "app/templates/index.html",
            filename: isProduction(argv) ? "../index.html" : "index.html"
        }),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(require("./package.json").version)
        })
    ]
});