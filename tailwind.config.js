/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ["./src/**/*.{html,ts}"],
    theme: {
        extend: {
            borderRadius: { xl: "14px", "2xl": "18px" },
        },
    },
    plugins: [],
};
