import type { Config } from "@docusaurus/types"
import type { Options as OptionsDocs } from "@docusaurus/plugin-content-docs"
import type { Options as OptionsPages } from "@docusaurus/plugin-content-pages"
import type { Options as OptionsTheme } from "@docusaurus/theme-classic"
import type { ThemeConfig, NavbarItem } from "@docusaurus/theme-common"

import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "rehype-katex/node_modules/katex/contrib/mhchem/mhchem"

const BASE_DIR = process.cwd()
const baseDocsOption = {
    remarkPlugins: [(remarkMath as any)],
    rehypePlugins: [rehypeKatex]
} as OptionsDocs

const organizationName = "problem-base"
const projectName = "problem-base.github.io"

export default {
    title: "PBase",
    baseUrl: "/",
    url: `https://${organizationName}.github.io`,
    organizationName, projectName,
    themes: [
        [
            '@docusaurus/theme-classic',
            {
                customCss: require.resolve(BASE_DIR + "/src/css/custom.css")
            } as OptionsTheme,
        ]
    ],
    themeConfig: {
        navbar: {
            title: "PBase",
            items: [
                {
                    type: "doc",
                    docId: "index",
                    position: "left",
                    label: "Archive"
                },
                {
                    id: "docs",
                    path: "docs",
                    to: "docs",
                    label: "Docs"
                }
            ] as NavbarItem[]
        },
    } as ThemeConfig,
    plugins: [
        [
            '@docusaurus/plugin-content-pages',
            {
                path: 'src/pages',
                routeBasePath: '/',
            } as OptionsPages
        ],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'default',
                path: 'archive',
                routeBasePath: 'archive',
                ...baseDocsOption
            } as OptionsDocs,
        ],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'docs',
                path: 'docs',
                routeBasePath: 'docs',
                ...baseDocsOption
            } as OptionsDocs,
        ],
    ],
    stylesheets: [
        {
            href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
            type: 'text/css',
            integrity:
                'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
            crossorigin: 'anonymous',
        },
    ],
} as Config