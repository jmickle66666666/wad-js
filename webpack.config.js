const path = require('path');

const wad = {
    name: 'wad',
    devtool: 'source-map',
    entry: {
        wad: './src/wad.ts',
    },
    mode: "production",
    module: {
        rules: [{
            exclude: /node_modules/,
            test: /\.(j|t)s$/,
            use: 'ts-loader'
        }]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.js', '.ts']
    }
};

const ui = {
    name: 'ui',
    devtool: 'source-map',
    entry: {
        ui: './src/ui.ts',
    },
    externals: {
        jquery: "jQuery",
    },
    mode: "production",
    module: {
        rules: [{
            exclude: /node_modules/,
            test: /\.(j|t)s$/,
            use: 'ts-loader'
        }]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/dist'),
    },
    resolve: {
        extensions: ['.js', '.ts']
    }
};

module.exports = [wad, ui];
