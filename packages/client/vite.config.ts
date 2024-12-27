import { defineConfig } from 'vite'
import dts from "vite-plugin-dts"
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      logLevel: 'silent'
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'main',
      formats: ['es'],
      fileName: (format) => `main.${format}.js`
    },
  }
})
