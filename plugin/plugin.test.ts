import fs from "fs"
import {read} from 'to-vfile'

import { Plugin, Processor, Settings } from 'unified'
import unified from "unified"
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from "unist-util-visit"
import { Node } from "unist"
import { relative, resolve } from "path"
import { customRemarkMapping } from "./customMappingPlugin"

//import { customRehypeMath, customRemarkMath } from "./customMathPlugin"

function loggerPlugin(this: Processor<Settings>) {
    this.Compiler = function (tree, file) {
        fs.writeFileSync("./plugin/.log", JSON.stringify(tree, null, 4))
        return String(file.value)
    }
}

async function main() {
    const file = await unified()
        .use(remarkParse)
        .use(customRemarkMapping, {
            problem: "./plugin/source",
            solution: "./plugin/target"
        })
        .use(remarkRehype)
        .use(rehypeStringify)
        //.use(loggerPlugin)
        .process(await read("./plugin/target/MA/test.md"))

    console.log("\n-----------")
    console.log(file.contents)
}

main()