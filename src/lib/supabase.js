import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Una configuración ausente muestra una pantalla útil en producción y una demo local.
let client = null;
let configurationError = "";
if (url && key) {
  try {
    client = createClient(url, key);
  } catch {
    configurationError =
      "Revisa que VITE_SUPABASE_URL sea una URL HTTPS válida y que la clave sea la publishable de ese proyecto.";
  }
} else if (url || key) {
  configurationError =
    "Falta uno de los dos valores de conexión: revisa la URL y la clave publishable.";
}
export const configured = Boolean(client);
export const demoMode = !url && !key && import.meta.env.DEV;
export const supabase = client;
export { configurationError };
