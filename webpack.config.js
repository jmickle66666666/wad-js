const path = require('path');

const wad = {
    name: 'wad',
    entry: {
        wad: './src/wad.js',
    },
    mode: "production",
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
    mode: "production",
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    }
};

module.exports = [ wad, ui ];
