import fs from "fs"

import unified, { Processor, Settings } from 'unified'
import remarkParse, { Parser, Tokenizer } from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

function loggerPlugin(this:Processor<Settings>){
    this.Compiler = function(tree, file){
        fs.writeFileSync("./plugin/.log", JSON.stringify(tree, null, 4))
        return String(file.contents)
    }
}

const createParser = ({ name, locator, tokenizer, type }:{
    name: string,
    locator: Tokenizer["locator"],
    tokenizer: Tokenizer,
    type: "inline" | "block"
}) => {
    return (proto:Parser) => {
        const method = type === "block" ? proto.blockMethods : proto.inlineMethods
        const anchor = type === "block" ? "fencedCode" : "text"
        method.splice(method.indexOf(anchor), 0, name)

        tokenizer.locator = locator
        proto.inlineTokenizers[name] = tokenizer
    }
}

const inlineMath = createParser({
    name: "inlineMath",
    locator: (value, fromIndex) => {
        return value.indexOf("$", fromIndex)
    },
    tokenizer: (eat, value) => {
        const length = value.length
        let index = 0

        if (value[index] !== "$") return

        while (index < length) {
            index++
            if (value[index] === "$") {
                index++
                break
            }
        }

        const raw = value.substring(0, index)
        const content = value.substring(1, index - 1)

        eat(raw)({
            type: "inlineMath",
            data: {
                content
            }
        })
    },
    type: "inline"
})

const midMath = createParser({
    name: "midMath",
    locator: (value, fromIndex) => {
        return value.indexOf("$$", fromIndex)
    },
    tokenizer: (eat, value) => {
        let index = 0
        const length = value.length

        const isFence = () => (
            value[index] === value[index + 1] && 
            value[index] === "$"
        )

        if(!isFence()) return

        while(index < length - 1){
            index++
            if(isFence()){
                index += 2
                break
            }
        }

        const raw = value.substring(0, index)
        const content = value.substring(2, index - 2)

        eat(raw)({
            type: "midMath",
            data: {
                content
            }
        })
    },
    type: "inline"
})

const blockMath = createParser({
    name: "blockMath",
    locator: (value, fromIndex) => {
        return value.indexOf("$$$", fromIndex) 
    },
    tokenizer: (eat, value) => {
        let index = 0
        const length = value.length

        const isFence = () => (
            value[index] === value[index + 1] && 
            value[index + 1] === value[index + 2] && 
            value[index] === "$"
        )

        if(!isFence()) return

        while(index < length - 2){
            index++
            if(isFence()){
                index += 3
                break
            }
        }

        const raw = value.substring(0, index)
        const content = value.substring(3, index - 3)

        eat(raw)({
            type: "blockMath",
            data: {
                content
            }
        })
    },
    type: "inline"
})

async function main() {
    const file = await unified()
        .use(remarkParse)
        //.use(remarkMath)
        //.use(remarkRehype)
        //.use(rehypeKatex)
        //.use(rehypeStringify)
        .use(function(){
            const proto:Parser = this.Parser.prototype

            blockMath(proto)
            midMath(proto)
            inlineMath(proto)
        })
        .use(loggerPlugin)
        .process(`$$$Block$$$ $$Mid$$ $Inline$`)

    console.log(String(file))
}

main()