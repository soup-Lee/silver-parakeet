import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";
import requireTransform from "vite-plugin-require-transform";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        charset: false,
        // additionalData: '@import "./src/assets/style/global.less";',
      },
    },
  },
  plugins: [
    vue(),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
    eslintPlugin({
      include: ["src/**/*.js", "src/**/*.vue", "src/*.js", "src/*.vue"],
    }),
    AutoImport({
      // targets to transform
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],

      // global imports to register
      imports: [
        // 插件预设支持导入的api
        "vue",
        "pinia",
        // 自定义导入的api
      ],

      // Generate corresponding .eslintrc-auto-import.json file.
      // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
      eslintrc: {
        enabled: true, //设置为true
        filepath: "./.eslintrc-auto-import.json",
        globalsPropValue: true,
      },

      // Filepath to generate corresponding .d.ts file.
      // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
      // Set `false` to disable.
      dts: "./auto-imports.d.ts",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // ...
          codemirror: [
            // Split CodeMirror code.
            "codemirror",
            "@codemirror/autocomplete",
            "@codemirror/commands",
            "@codemirror/language",
            "@codemirror/lint",
            "@codemirror/search",
            "@codemirror/state",
            "@codemirror/view",
            // Add the following as needed.
            "@codemirror/lang-html",
            "@codemirror/lang-javascript",
          ],
          // ...
        },
      },
    },
  },
});
