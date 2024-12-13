import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPath from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPath()],
});
