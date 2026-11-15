import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPath from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPath(),
    tailwindcss(),
    sentryVitePlugin({
      org: "project-nessus",
      project: "mycharacterv2",
    }),
  ],

  // export/import 웹 워커가 사용하는 의존성.
  // 첫 사용 시 Vite가 뒤늦게 최적화하면서 페이지를 리로드해 다운로드가 유실되는 것을 방지한다.
  optimizeDeps: {
    include: ["jszip"],
  },

  build: {
    sourcemap: true,
  },
});
