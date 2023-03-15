import fs from "fs"

import { Processor, Settings } from 'unified'
import unified from "unified"
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

import { customRehypeMath, customRemarkMath } from "./customMathPlugin"

function loggerPlugin(this: Processor<Settings>) {
    this.Compiler = function (tree, file) {
        fs.writeFileSync("./plugin/.log", JSON.stringify(tree, null, 4))
        return String(file.contents)
    }
}

async function main() {
    const file = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(customRehypeMath)
        .use(customRemarkMath)
        .use(rehypeStringify)
        .use(loggerPlugin)
        .process(`
$$$
\\frac{1}{2}
$$$
`)

    console.log(String(file))
}

main()