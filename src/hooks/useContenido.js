import { useCallback, useEffect, useState } from "react";
import { readContent } from "../lib/contenido";
import { configured, demoMode } from "../lib/supabase";
export function useContenido() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setError("");
    try {
      if (configured || demoMode) setData(await readContent());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, error, loading, reload };
}
