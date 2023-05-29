import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginConsole  from 'vite-plugin-consoles'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vitePluginConsole()],
})
