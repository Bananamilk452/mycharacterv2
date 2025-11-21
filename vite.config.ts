import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPath from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPath(), tailwindcss(), sentryVitePlugin({
    org: "project-nessus",
    project: "mycharacterv2"
  })],

  build: {
    sourcemap: true
  }
});