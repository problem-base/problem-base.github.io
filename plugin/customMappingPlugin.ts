import { readFileSync, existsSync } from "fs"
import { relative, resolve } from "path"
import unified, { Plugin, Processor, Settings } from "unified"
import { Node } from "unist"
import { visit } from "unist-util-visit"

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

function parseHeading(content:string, parser:Processor<Settings>["parse"]){
    const headingRecord:Record<string, any[]> = {}

    const tree = parser(content)

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

    const parser = this.parse
    return function(tree:Node & { children: Node[] }, file){
        const relativePath = relative(solution, file.history[0])
        const problemPath = resolve(problem, relativePath)

        if(!existsSync(problemPath)) throw `Problem file in ${problemPath} is not exist`
        const headingProblem = parseHeading(readFileSync(problemPath, "utf-8"), parser)

        const headingTracker = createHeadingTracker()
        const deffered: [
            Node & {children: Node[]}, 
            number, 
            Node[]
        ][] = []

        visit(tree, null, function(element, _, parent){
            if(element.type === "heading"){
                headingTracker.track(element)
                const curr = headingTracker.currentHeading
                const index = parent?.children.indexOf(element)
                if(!parent || index === undefined || !(curr in headingProblem)) return
                deffered.push([parent, index + 1, headingProblem[curr]])
            }
        })

        for(let i = deffered.length - 1; i >= 0; --i){
            const [parent, index, children] = deffered[i]
            parent.children.splice(index, 0, ...children, { type: "thematicBreak" })
        }
    }
} as Plugin<[{
    problem:string,
    solution:string,
}]>

export { customRemarkMapping }