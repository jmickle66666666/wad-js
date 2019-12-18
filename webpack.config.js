const path = require("path");

const wad = {
    name: "wad",
    devtool: "source-map",
    entry: {
        wad: "./src/wad/index.ts"
    },
    mode: "production",
    module: {
        rules: [
            {
                include: [path.resolve(__dirname, "src/wad")],
                test: /\.(j|t)s$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.wad.json"
                        }
                    }
                ]
            }
        ]
    },
    output: {
        filename: "wad.js",
        library: "wadJS",
        path: path.resolve(__dirname, "dist")
    },
    resolve: {
        extensions: [".js", ".ts"]
    }
};

/* const ui = {
    name: "ui",
    devtool: "source-map",
    entry: {
        ui: "./src/ui/index.ts"
    },
    externals: {
        jquery: "jQuery",
    },
    mode: "production",
    module: {
        rules: [
            {
                include: [path.resolve(__dirname, "src/ui")],
                test: /\.(j|t)s$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.ui.json"
                        }
                    }
                ]
            }
        ]
    },
    output: {
        filename: "ui.js",
        path: path.resolve(__dirname, "public/dist")
    },
    resolve: {
        extensions: [".js", ".ts"]
    }
}; */

module.exports = [wad];
