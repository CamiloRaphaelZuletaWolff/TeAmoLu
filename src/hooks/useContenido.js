import { useCallback, useEffect, useState } from "react";
import { demoMode, supabase } from "../lib/supabase";
import { demoData } from "../lib/demo";
export function useContenido() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setError("");
    if (demoMode) {
      setData(demoData);
      setLoading(false);
      return;
    }
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const results = await Promise.all([
        supabase.from("config").select("*").eq("id", 1).single(),
        supabase.from("momentos").select("*").order("fecha"),
        supabase
          .from("cartas")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("canciones").select("*").order("created_at"),
      ]);
      const failure = results.find((result) => result.error);
      if (failure) throw failure.error;
      setData(
        Object.fromEntries(
          ["config", "momentos", "cartas", "canciones"].map((key, index) => [
            key,
            results[index].data,
          ]),
        ),
      );
    } catch {
      setError(
        "No pudimos cargar nuestros recuerdos. Comprueba la conexión y que Supabase tenga las cuatro tablas y la fila de configuración.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, error, loading, reload };
}
