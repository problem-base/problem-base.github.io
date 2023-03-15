import { defineConfig } from "rollup"
import typescript from "@rollup/plugin-typescript"
import nodeResolve from "@rollup/plugin-node-resolve";

const BASE_DIR = process.cwd()
export default defineConfig({
    input: `${BASE_DIR}/config/docusaurus.config.ts`,
    treeshake: true,
    external: [/katex/, /remark/, /rehype/, /unified/],
    output: {
        file: `${BASE_DIR}/docusaurus.config.js`,
        format: "cjs",
    },
    plugins: [
        typescript(),
        nodeResolve({
            modulesOnly: true
        }),
    ]
})