import fs from "fs"

import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

async function main() {
    const file = await unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .process(`$Hello$`)

    console.log(String(file))
}

main()