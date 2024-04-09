/* eslint-disable node/no-unpublished-require */

const svelte = require("rollup-plugin-svelte");
const { default: resolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { babel } = require("@rollup/plugin-babel");
const livereload = require("rollup-plugin-livereload");
const { terser } = require("rollup-plugin-terser");
const css = require("rollup-plugin-css-only");

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  input: {
    dashboard: "src/dashboard/index.js",
    loginPage: "src/loginPage/index.js"
  },
  output: {
    sourcemap: true,
    format: "es",
    name: "app",
    dir: "public", // Output directory
    entryFileNames: "[name].js", // Output file name pattern
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),

    css({ output: "bundle.css" }),

    babel({
      extensions: [".js", ".mjs", ".svelte"],
      babelHelpers: "runtime",
      include: ["src/**", "node_modules/svelte/**"],
    }),

    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),

    commonjs(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
