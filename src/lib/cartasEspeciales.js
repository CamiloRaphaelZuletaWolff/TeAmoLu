import { supabase, demoMode } from "./supabase";
import { readLocal } from "./localStore";
import { cartasDisponibles } from "./festividades.js";

const errorLectura = (error) =>
  new Error(
    ["PGRST202", "PGRST205", "42P01", "42883"].includes(error?.code)
      ? "Para activar las cartas especiales, ejecuta supabase/04-cartas-especiales.sql en el SQL Editor de Supabase y vuelve a intentarlo."
      : "No pudimos cargar las cartas especiales. Revisa tu conexión y vuelve a intentarlo.",
  );

// En producción, el reloj de Postgres decide qué cartas se publicaron.
export async function leerEspecialesVisibles() {
  if (demoMode) {
    const data = await readLocal();
    const ahora = new Date().toISOString();
    return { ahora, cartas: cartasDisponibles(data.cartas_especiales, ahora) };
  }
  const { data, error } = await supabase.rpc("leer_cartas_especiales");
  if (error) throw errorLectura(error);
  return data;
}
