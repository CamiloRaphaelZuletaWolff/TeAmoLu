import { supabase, demoMode } from "./supabase";
import { readLocal, saveLocal, deleteLocal } from "./localStore";
import { cartasDisponibles, prepararCartaEspecial } from "./festividades.js";

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
// La planificación se carga únicamente al abrir el editor, separado de la colección.
export async function leerPlanificacion() {
  if (demoMode)
    return [...(await readLocal()).cartas_especiales].sort((a, b) =>
      a.fecha.localeCompare(b.fecha),
    );
  const { data, error } = await supabase
    .from("cartas_especiales")
    .select("*")
    .order("fecha");
  if (error) throw errorLectura(error);
  return data;
}
export async function guardarEspecial(values, id) {
  const payload = prepararCartaEspecial(values);
  if (demoMode) return saveLocal("cartas_especiales", payload, id);
  const query = id
    ? supabase.from("cartas_especiales").update(payload).eq("id", id)
    : supabase.from("cartas_especiales").insert(payload);
  const { data, error } = await query.select("id").single();
  if (error)
    throw new Error(
      "No se pudo guardar la carta. Revisa tu conexión y que hayas ejecutado el SQL 04.",
    );
  return data;
}
export async function eliminarEspecial(id) {
  if (demoMode) return deleteLocal("cartas_especiales", id);
  const { data, error } = await supabase
    .from("cartas_especiales")
    .delete()
    .eq("id", id)
    .select("id");
  if (error || !data?.length)
    throw new Error("No se pudo eliminar la carta. Reinténtalo.");
}
