// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    corePlugins: {
        preflight: false, 
    },
    content: ["./src/pages/**/*.{js,jsx,ts,tsx}"], 
    darkMode: ['class', '[data-theme="dark"]'], 
    theme: {
        extend: {},
    },
    plugins: [],
}