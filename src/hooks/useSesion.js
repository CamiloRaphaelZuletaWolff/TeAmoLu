import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
export function useSesion() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    if (!supabase) return;
    let active = true,
      changed = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, value) => {
      changed = true;
      if (active) setSession(value);
    });
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active && !changed) setSession(data.session);
      })
      .catch(() => {
        if (active && !changed) setSession(null);
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  return session;
}
