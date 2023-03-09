import { defineConfig } from "rollup"
import typescript from "@rollup/plugin-typescript"
import { globSync } from "glob";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path"
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const BASE_DIR = process.cwd()

const file = globSync(`${BASE_DIR}/plugin/**/*.ts`).map(file => 
    path.relative(`${BASE_DIR}/plugin`, file.slice(0, file.length - path.extname(file).length))
)

const input = {}
file.forEach(file => {
    if(file != "index") input[file] = `${BASE_DIR}/plugin/${file}.ts`
})

async function runTesting() {
    try {
        const { stdout } = await promisify(exec)("node .plugin/plugin.test.mjs")
        console.log(stdout)
    } catch (error) {
        console.warn(error.stderr)
    }
}

export default defineConfig({
    input,
    output: {
        dir: `${BASE_DIR}/.plugin`,
        entryFileNames: "[name].mjs",
    },
    treeshake: true,
    external: [/node_modules/],
    plugins: [
        typescript({
            compilerOptions: {
                target: "ES2020"
            }
        }),
        resolve({
            modulesOnly: true,
        }),
        {
            buildEnd() {
                setTimeout(runTesting, 300);
            }
        },
    ]
})