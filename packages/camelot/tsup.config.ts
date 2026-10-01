import { copyFile, readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "tsup";

const globalSheets = ["tokens", "base", "type", "motion"].map((name) => `src/styles/${name}.css`);

export default defineConfig([
  {
    // Plain functions and constants, importable from Server Components.
    entry: { helpers: "src/helpers.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    target: "es2022",
  },
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    target: "es2022",
    external: ["react", "react-dom", "react/jsx-runtime"],
    // tsup applies one loader to every .css file, so only component modules are imported from JS;
    // the global sheets are prepended to their output below.
    loader: { ".css": "local-css" },
    // One bundle means one module boundary, so the directive has to sit on the bundle itself.
    banner: { js: '"use client";' },
    async onSuccess() {
      const globals = await Promise.all(globalSheets.map((path) => readFile(path, "utf8")));
      const components = await readFile("dist/index.css", "utf8");
      await writeFile("dist/styles.css", [...globals, components].join("\n"));
      await copyFile("src/styles/tokens.css", "dist/tokens.css");
    },
  },
]);
