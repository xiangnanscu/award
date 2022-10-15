import { readFileSync } from "fs";
import { defineConfig, resolveBaseUrl } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
const baseUrl = process.env.DEPLOY_OWN ? '/' : '/award/'
console.log({ baseUrl, DEPLOY_OWN: process.env.DEPLOY_OWN })
export default defineConfig({
  base: baseUrl,
  plugins: [
    vue(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    }),
    {
      // this plugin handles ?b64 tags
      name: "vite-b64-plugin",
      transform(code, id) {
        if (!id.match(/\?b64$/)) return;
        // console.log(id, code);
        var path = id.replace(/\?b64/, "");
        var data = readFileSync(path, "base64");
        return `export default '${data}'`;
      },
    },
    AutoImport({
      imports: ['vue'],
      dirs: [
        './composables', './src/components'
      ],
      vueTemplate: true,
    }),
  ],
});
