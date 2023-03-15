import unified from "unified"
import rehypeParse from "rehype-parse"
import { visit } from "unist-util-visit"

import type { Node } from "unist"
import type { Parent } from "unist-util-visit/lib"
import type { Processor, Settings, Plugin } from 'unified'
import type { Add, Parser, Tokenizer } from 'remark-parse'

import katex from "katex"
import "katex/dist/contrib/mhchem.js"

interface MathDataParser {
    hName: "span" | "div",
    hProperties: Record<string, string | string[]>,
    hChildren: [{
        type: "text",
        value: string
    }]
}

interface MathVisitedNode {
    type: "element",
    tagName: "span" | "div",
    properties: MathDataParser["hProperties"],
    children: any[]
}

interface ProtoTokenizer extends Tokenizer {
    (eat: (value: string) => ((node: Node<MathDataParser> & {
        value: string
    }, parent?: Parent) => Add), value: string): void
}

interface ProtoParser extends Parser {
    interruptParagraph: string[],
    interruptList: string[],
    interruptBlockquote: string[],
    blockTokenizers: Record<string, ProtoTokenizer>
}

const parseHTML = unified().use(rehypeParse, { fragment: true })

const createParser = ({ name, locator, tokenizer, type }: {
    name: string,
    locator: ProtoTokenizer["locator"],
    tokenizer: ProtoTokenizer,
    type: "inline" | "block"
}) => {
    return (parser: ProtoParser) => {
        const method = type === "block" ? parser.blockMethods : parser.inlineMethods
        const anchor = type === "block" ? "fencedCode" : "text"
        method.splice(method.indexOf(anchor), 0, name)

        tokenizer.locator = locator

        const protoToken = type === "block" ? parser.blockTokenizers : parser.inlineTokenizers
        protoToken[name] = tokenizer
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

        const isFence = () => value[index] === "$"

        if (!isFence()) return
        let contentStart = 1, contentEnd

        while (index < length) {
            index++
            if (value[index] === "$") {
                contentEnd = index
                index++
                break
            }
        }

        if (!contentEnd) return

        const raw = value.substring(0, index)
        const content = value.substring(contentStart, contentEnd)

        eat(raw)({
            type: "inlineMath",
            value: content,
            data: {
                hName: "span",
                hProperties: {
                    className: [
                        "math",
                        "math-inline"
                    ]
                },
                hChildren: [{
                    type: "text",
                    value: content
                }]
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

        if (!isFence()) return
        let contentStart = 2, contentEnd

        while (index < length - 1) {
            index++
            if (isFence()) {
                contentEnd = index
                index += 2
                break
            }
        }

        if (!contentEnd) return

        const raw = value.substring(0, index)
        const content = value.substring(contentStart, contentEnd)

        eat(raw)({
            type: "midMath",
            value: content,
            data: {
                hName: "span",
                hProperties: {
                    className: [
                        "math",
                        "math-mid"
                    ]
                },
                hChildren: [{
                    type: "text",
                    value: content
                }]
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

        if (!isFence()) return
        let contentStart = 3, contentEnd

        while (index < length - 2) {
            index++
            if (isFence()) {
                contentEnd = index
                index += 3
                break
            }
        }

        if (!contentEnd) return

        const raw = value.substring(0, index)
        const content = value.substring(contentStart, contentEnd).trim()

        eat(raw)({
            type: "blockMath",
            value: content,
            data: {
                hName: "span",
                hProperties: {
                    className: [
                        "math",
                        "math-block"
                    ]
                },
                hChildren: [{
                    type: "text",
                    value: content
                }]
            }
        })
    },
    type: "block"
})

const customRemarkMath = function(this: Processor<Settings>){
    const parserProto = this.Parser.prototype as ProtoParser
    blockMath(parserProto)
    midMath(parserProto)
    inlineMath(parserProto)
} as Plugin

const customRehypeMath = function (this: Processor<Settings>) {
    return function (tree: Node) {
        visit(tree, 'element', function (element: MathVisitedNode) {
            const classes = element.properties.className || [] as string[]
            if (!classes.includes("math")) return

            const value = element.children[0].value
            let renderedKatex = ""

            if (value === undefined) throw Error("Math value has already been compiled with another compiler")

            try {
                if (classes.includes("math-inline")) {
                    renderedKatex = katex.renderToString(value)
                } else if (classes.includes("math-mid")) {
                    renderedKatex = katex.renderToString("\\displaystyle " + value)
                } else {
                    renderedKatex = katex.renderToString(value, {
                        displayMode: true
                    })
                }
            } catch (error) {
                renderedKatex = katex.renderToString(value, {
                    throwOnError: false
                })
            }
            const parsed = parseHTML.parse(renderedKatex) as Node & { children: any }
            element.children = parsed.children
        })
    }
} as Plugin

export { customRehypeMath, customRemarkMath }