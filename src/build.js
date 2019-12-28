/**
 * Various build scripts.
 */
const { execSync } = require("child_process");
const {
    copyFileSync,
    readdirSync,
    rmdirSync,
    statSync,
    unlinkSync
} = require("fs");
const { join } = require("path");

/**
 * Delete a directory tree recursively.
 *
 * @param {string} path
 */
const deleteSync = path => {
    try {
        const s = statSync(path);
        if (s.isDirectory()) {
            const dir = readdirSync(path);
            for (const file of dir) {
                const newPath = join(path, file);
                deleteSync(newPath);
            }
            rmdirSync(path);
        } else {
            unlinkSync(path);
        }
    } catch {
        // Do nothing
    }
};

/**
 * Create UMD and ES6 module libraries.
 */
const distTask = () => {
    execSync("npx rollup --config rollup.wad.config.js");
};

/**
 * Build the UI app.
 */
const uiTask = () => {
    distTask();
    execSync("npx rollup --config rollup.ui.config.js");
    const files = ["wad.js", "wad.js.map"];
    for (const file of files) {
        const src = join(__dirname, "../dist/umd", file);
        const dst = join(__dirname, "../public/dist", file);
        copyFileSync(src, dst);
    }
};

/**
 * Clean all library and distribution files.
 */
const cleanTask = () => {
    const paths = ["dist", "lib", "public/dist"];
    for (const path of paths) {
        const fullpath = join(__dirname, "..", path);
        deleteSync(fullpath);
    }
};

if (process.argv.length < 3) {
    console.debug("must supply task as parameter");
    process.exit(1);
}

const task = process.argv[2];
switch (task) {
    case "dist":
        distTask();
        break;
    case "ui":
        uiTask();
        break;
    case "clean":
        cleanTask();
        break;
    default:
        console.debug("unknown task");
        process.exit(1);
}

process.exit(0);
