const typescript = require("rollup-plugin-typescript2");

module.exports = {
    input: "src/wad/index.ts",
    output: [
        {
            file: "dist/umd/wad.js",
            format: "umd",
            name: "wadJS",
            sourcemap: true
        },
        {
            file: "dist/esm/wad.jsm",
            format: "esm",
            sourcemap: true
        }
    ],
    plugins: [
        typescript({
            tsconfig: "src/wad/tsconfig.json",
            tsconfigOverride: {
                compilerOptions: {
                    declaration: false,
                    module: "ESNext"
                }
            }
        })
    ]
};
