import typescript from "rollup-plugin-typescript2";

export default [
  {
    input: "./src/coolit.ts",
    plugins: [typescript()],
    output: {
      file: "dist/coolit.umd.js",
      name: "coolit",
      format: "umd"
    }
  },
  {
    input: "./src/coolit.ts",
    plugins: [typescript()],
    output: {
      file: "dist/coolit.mjs",
      name: "coolit",
      format: "es"
    }
  }
];
