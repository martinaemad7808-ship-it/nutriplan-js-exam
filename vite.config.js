import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  // SPA: serve index.html for /home, /meal/..., /products, /foodlog, /settings
  appType: "spa",
});
