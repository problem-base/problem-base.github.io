import type { Config } from "@docusaurus/types"
import type { Options as OptionsDocs } from "@docusaurus/plugin-content-docs"
import type { Options as OptionsPages } from "@docusaurus/plugin-content-pages"
import type { Options as OptionsTheme } from "@docusaurus/theme-classic"
import type { ThemeConfig, NavbarItem } from "@docusaurus/theme-common"

import { customRehypeMath, customRemarkMath } from "@plugin/customMathPlugin"
import {resolve} from "path"
import { customRemarkMapping } from "@plugin/customMappingPlugin"

const BASE_DIR = process.cwd()
const organizationName = "problem-base"
const projectName = "problem-base.github.io"

export default {
    title: "Base",
    baseUrl: "/",
    url: `https://${organizationName}.github.io`,
    organizationName, projectName,
    staticDirectories: ["src/static"],
    themes: [
        [
            '@docusaurus/theme-classic',
            {
                customCss: resolve(BASE_DIR + "/src/css/custom.css")
            } as OptionsTheme,
        ]
    ],
    themeConfig: {
        navbar: {
            title: "⁋ Base",
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
        async function myPlugin() {
            return {
                name: "docusaurus-tailwindcss",
                configurePostCss(postcssOptions) {
                    // Appends TailwindCSS and AutoPrefixer.
                    postcssOptions.plugins.push(require("tailwindcss"));
                    postcssOptions.plugins.push(require("autoprefixer"));
                    if(process.env.NODE_ENV === "production"){
                        postcssOptions.plugins.push(require("cssnano"))
                    }
                    return postcssOptions;
                },
            };
        },
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
                remarkPlugins: [customRemarkMath],
                rehypePlugins: [customRehypeMath]
            } as OptionsDocs,
        ],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'docs',
                path: 'docs',
                routeBasePath: 'docs',
                remarkPlugins: [customRemarkMath],
                rehypePlugins: [customRehypeMath]
            } as OptionsDocs,
        ],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: "solution",
                path: 'archive_solution',
                routeBasePath: 'solution',
                remarkPlugins: [
                    customRemarkMath,
                    [
                        customRemarkMapping, {
                            problem: "./archive",
                            solution: "./archive_solution",
                        }
                    ],
                ],
                rehypePlugins: [customRehypeMath]
            } as OptionsDocs
        ]
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