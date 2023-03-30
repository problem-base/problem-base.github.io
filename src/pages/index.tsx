import React from "react"
import Layout from "@theme/Layout"

export default function Page(){
    return <Layout>
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="flex flex-col items-center">
                <h1 className="text-5xl">Welcome to ⁋ Base!</h1>
                <a href="/archive">
                    <button className="border-none bg-transparent bg-blue-600 p-4 text-2xl cursor-pointer text-white">Open Archive</button>
                </a>
                <p>or check <a href="/docs">documentation</a></p>
            </div>
        </div>
    </Layout>
}