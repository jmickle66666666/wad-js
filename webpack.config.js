const path = require('path');

const wad = {
    name: 'wad',
    entry: {
        wad: './src/wad.js',
    },
    devtool: 'source-map',
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
    }
};

const ui = {
    name: 'ui',
    entry: {
        ui: './src/ui.js',
    },
    devtool: 'source-map',
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
    }
};

module.exports = [ wad, ui ];
