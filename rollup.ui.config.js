const typescript = require("@rollup/plugin-typescript");

module.exports = {
    external: ["jquery", "wad"],
    input: "src/ui/index.ts",
    output: [
        {
            file: "public/dist/ui.js",
            format: "iife",
            globals: {
                jquery: "jQuery",
                wad: "wadJS"
            },
            sourcemap: true
        }
    ],
    plugins: [
        typescript({
            tsconfig: "tsconfig.ui.json"
        })
    ]
};
