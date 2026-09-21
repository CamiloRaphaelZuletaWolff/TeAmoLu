import { useCallback, useEffect, useRef, useState } from "react";
import { leerEspecialesVisibles } from "../lib/cartasEspeciales";
import { hastaMedianocheBolivia } from "../lib/festividades";

export function useCartasEspeciales() {
  const [state, setState] = useState({
    cartas: [],
    ahora: null,
    loading: true,
    error: "",
  });
  const timer = useRef(),
    request = useRef(0);
  const reload = useCallback(async () => {
    const id = ++request.current;
    clearTimeout(timer.current);
    try {
      const data = await leerEspecialesVisibles();
      if (id !== request.current) return;
      setState({ ...data, loading: false, error: "" });
      // Se consulta otra vez justo después de medianoche, sin tener que recargar.
      timer.current = setTimeout(
        () => reload(),
        hastaMedianocheBolivia(data.ahora) + 100,
      );
    } catch (err) {
      if (id !== request.current) return;
      setState((previous) => ({
        ...previous,
        loading: false,
        error: err.message,
      }));
      timer.current = setTimeout(() => reload(), 60000);
    }
  }, []);
  useEffect(() => {
    reload();
    const wake = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    window.addEventListener("online", wake);
    return () => {
      ++request.current;
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("online", wake);
    };
  }, [reload]);
  return { ...state, reload };
}
