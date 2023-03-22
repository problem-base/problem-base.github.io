import fs from "fs"
import { relative, resolve } from "path"
import remarkParse from 'remark-parse'
import unified, { Plugin, Processor, Settings } from "unified"
import { Node } from "unist"
import { visit } from "unist-util-visit"

const markdownParser = unified().use(remarkParse)

function createHeadingTracker(){
    const depths:number[] = [0]
    const headings:string[] = []

    const obj = {
        currentHeading: "",
        track: (element: Node)=>{
            const depth = (element as any).depth
            const heading = (element as any).children[0].value
            const currentDepth = depths[depths.length - 1]

            if (depth <= currentDepth) {
                let i = depths.length - 1
                while (depths[i] >= depth) {
                    depths.pop()
                    headings.pop()
                    i--
                }
            }

            headings.push(heading)
            depths.push(depth)

            obj.currentHeading = headings.join(".")
        }
    }

    return obj
}

function parseHeading(content:string){
    const headingRecord:Record<string, any[]> = {}

    const tree = markdownParser.parse(content)

    unified()
        .use(function () {
            return function (tree) {
                let currentParent: {children: Node} 
                const headingTracker = createHeadingTracker()

                visit(tree, null, function (element, _, parent) {
                    if (element.type === "heading") {
                        headingTracker.track(element)
                        currentParent = parent
                    } else {
                        if((parent as Node)?.type === "heading") return
                        if((parent) !== currentParent) return
                        
                        const curr = headingTracker.currentHeading
                        if(!curr) return
                        if(!(curr in headingRecord)) headingRecord[curr] = []

                        headingRecord[curr].push(element)
                    }
                })
            }
        })
        .run(tree)

    return headingRecord
}

const customRemarkMapping = function(this:Processor<Settings>, { problem, solution }){
    if(!problem || !solution) throw "Problem or Solution is undefined"

    return function (tree:Node, file:any) {
        const relativePath = relative(solution, file.history[0])
        const problemPath = resolve(problem, relativePath)

        if(!fs.existsSync(problemPath)) return
        const problemTree = markdownParser.parse(fs.readFileSync(problemPath))
        const solutionHeading = parseHeading(String(file.value))

        // @ts-ignore
        tree.children = problemTree.children
        tree.position = problemTree.position

        // Deffered application, so it won't conflict with current tree
        const deferred: [{ children: Node[] }, number, Node[]][] = []
        const headingTracker = createHeadingTracker()
        
        visit(tree, null, function (element, _, parent: {
            children: Node[]
        }) {
            if (element.type === "heading") {
                headingTracker.track(element)
                const curr = headingTracker.currentHeading
                const index = parent.children.indexOf(element)
                if (curr in solutionHeading) deferred.push([parent, index + 1, solutionHeading[curr]])
            }
        })

        // Sorted from largest to smallest index
        deferred.sort(([_a, a], [_b, b]) => {
            return b - a
        })

        for (const [parent, index, children] of deferred) {
            const line = {
                type: "thematicBreak",
                indent: []
            } as Node
            parent.children.splice(index, 0, ...children, line)
        }
    }
} as Plugin<[{
    problem:string,
    solution:string
}]>

export { customRemarkMapping }

