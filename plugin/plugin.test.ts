import fs from "fs"

import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import type { Construct, Extension } from 'micromark-util-types'

const BASE_DIR = process.cwd()
main()

function pushObjGuard<T>(obj: Record<string, T[]>, field: string, value: T){
    if(!obj[field]) obj[field] = []
    obj[field].push(value)
}

function fileLogger(str:string){
    fs.writeFileSync(`${BASE_DIR}/plugin/log`, str)
}

async function main() {
    function customCompiler(tree:any){
        fileLogger(JSON.stringify(tree, null, 4))
    }

    const file = await unified()

        // Markdown parser
        .use(remarkParse)
        .use(remarkMath)
        .use(function () {
            const data = this.data() as any as Record<string, Extension[]>
            pushObjGuard(data, "micromarkExtensions", {
                ['$']:{
                    tokenize: function(effect, ok, nok){
                        
                    }
                } as Construct
            })
        })

        // HTML Parser
        //.use(remarkRehype)
        //.use(rehypeKatex)
        //.use(rehypeStringify)

        .use(function(){ Object.assign(this, { Compiler: customCompiler })})
        .process(`
Ini tulisan$$
        `)

    console.log(String(file))
}