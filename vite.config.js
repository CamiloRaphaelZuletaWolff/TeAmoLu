import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Solo estas dos variables públicas se incorporan al navegador.
  // Acepta los nombres de Vercel sin prefijo y conserva los .env existentes.
  const url = env.VITE_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim() || "";
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
    || env.SUPABASE_PUBLISHABLE_KEY?.trim() || "";
  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(url),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(key),
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            motion: ["framer-motion"],
            supabase: ["@supabase/supabase-js"],
          },
        },
      },
    },
  };
});
