import { supabase, demoMode } from "./supabase";
import { readLocal, saveLocal, deleteLocal } from "./localStore";

// El mensaje amable no basta para depurar: añadimos qué tabla falló y por qué.
const detalle = (tables, results) =>
  tables
    .map((table, i) => results[i].error && `${table}: ${results[i].error.message}`)
    .filter(Boolean)
    .join(" · ");

export async function readContent() {
  if (demoMode) return readLocal();
  const tables = ["config", "momentos", "cartas", "fotos"];
  const results = await Promise.all([
    supabase.from("config").select("*").eq("id", 1).single(),
    supabase.from("momentos").select("*").order("fecha"),
    supabase
      .from("cartas")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("fotos")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);
  if (results.some((r) => r.error))
    throw new Error(
      `No se pudieron cargar los recuerdos. Revisa la conexión y ejecuta supabase/03-tercer-mes-sin-login.sql si actualizaste la versión anterior. (${detalle(tables, results)})`,
    );
  return Object.fromEntries(tables.map((table, i) => [table, results[i].data]));
}
export async function saveRecord(table, payload, id) {
  if (demoMode) return saveLocal(table, payload, id);
  const query = id
    ? supabase.from(table).update(payload).eq("id", id)
    : supabase.from(table).insert(payload);
  const { data, error } = await query.select("id").single();
  if (error)
    throw new Error(
      `No se pudo guardar. Revisa la conexión y ejecuta el SQL de edición sin login (03) en Supabase. (${error.message})`,
    );
  return data;
}
export async function deleteRecord(table, id) {
  if (demoMode) {
    await deleteLocal(table, id);
    return;
  }
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .select("id");
  if (error || !data?.length)
    throw new Error(
      `No se pudo eliminar. Revisa la conexión y el SQL de edición sin login. (${error?.message || "la fila ya no existe o RLS la oculta"})`,
    );
}
