import fs from "fs"

import { Processor, Settings } from 'unified'
import unified from "unified"
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

function loggerPlugin(this: Processor<Settings>) {
    this.Compiler = function (tree, file) {
        fs.writeFileSync("./plugin/.log", JSON.stringify(tree, null, 4))
        return String(file.value)
    }
}

async function main() {
    const file = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeStringify)
        //.use(loggerPlugin)
        .process("Test")

    console.log("\n-----------")
    console.log(file.contents)
}

main()