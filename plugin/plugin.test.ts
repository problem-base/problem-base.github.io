import fs from "fs"
import {read} from 'to-vfile'

import { Processor, Settings } from 'unified'
import unified from "unified"
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from "unist-util-visit"

//import { customRehypeMath, customRemarkMath } from "./customMathPlugin"

function loggerPlugin(this: Processor<Settings>) {
    this.Compiler = function (tree, file) {
        fs.writeFileSync("./plugin/.log", JSON.stringify(tree, null, 4))
        return String(file.contents)
    }
}

async function main() {
    const file = await unified()
        .use(remarkParse)
        .use(function(){
            return function(tree, file){
                const visited: any[] = []
                visit(tree, null, function(element){
                    if(element.type === "heading"){
                        visited.push(element.depth)
                    }
                })
                console.log(visited)
            }
        })
        //.use(remarkRehype)
        //.use(rehypeStringify)
        .use(loggerPlugin)
        .process(await read("./plugin/source/test.md"))

    console.log(file.contents)
}

main()