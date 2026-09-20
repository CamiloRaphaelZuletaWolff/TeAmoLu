import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  Music2,
  Mail,
  Camera,
  Settings2,
  LogOut,
  X,
} from "lucide-react";
import {
  configured,
  demoMode,
  supabase,
  configurationError,
} from "./lib/supabase";
import { celebrate } from "./lib/confetti";
import { useContenido } from "./hooks/useContenido";
import { useSesion } from "./hooks/useSesion";
import { Hero } from "./componentes/Hero";
import { Timeline, Galeria } from "./componentes/Recuerdos";
import { Cartas } from "./componentes/Cartas";
import { Playlist } from "./componentes/Playlist";
import { Divider, Reveal } from "./componentes/UI";
import { Editor, ModalLogin, DeleteDialog } from "./componentes/Edicion";

const hearts = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 9) % 100}%`,
  size: `${12 + ((i * 7) % 22)}px`,
  duration: `${20 + ((i * 3) % 19)}s`,
  delay: `${-i * 3.7}s`,
}));
function FondoCorazones() {
  const reduced = useReducedMotion();
  if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return null;
  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((heart, i) => (
        <span
          key={i}
          style={{
            left: heart.left,
            fontSize: heart.size,
            animationDuration: heart.duration,
            animationDelay: heart.delay,
          }}
        >
          ♡
        </span>
      ))}
    </div>
  );
}
function App() {
  const { data, error, loading, reload } = useContenido(),
    session = useSesion();
  const [login, setLogin] = useState(false),
    [editor, setEditor] = useState(null),
    [deletion, setDeletion] = useState(null),
    [toast, setToast] = useState("");
  const [loaderVisible, setLoaderVisible] = useState(true);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => setLoaderVisible(false), reduced ? 0 : 350);
    return () => clearTimeout(timer);
  }, [loading, reduced]);
  const clicks = useRef({ count: 0, time: 0 });
  useEffect(() => {
    if (!session) {
      setEditor(null);
      setDeletion(null);
    }
  }, [session]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 10000);
    return () => clearTimeout(timer);
  }, [toast]);
  function secretLogin() {
    const now = Date.now();
    clicks.current.count =
      now - clicks.current.time < 1800 ? clicks.current.count + 1 : 1;
    clicks.current.time = now;
    if (clicks.current.count >= 3) {
      clicks.current.count = 0;
      if (!session) setLogin(true);
    }
  }
  async function logout() {
    const { error } = await supabase.auth.signOut();
    setToast(
      error
        ? "No se pudo cerrar la sesión. Inténtalo otra vez."
        : "Hasta el próximo recuerdo. ♡",
    );
  }
  const edit = (table, item) => setEditor({ table, item }),
    remove = (table, item) => setDeletion({ table, item });
  if (loading || loaderVisible)
    return (
      <motion.main
        className="status-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.3 }}
      >
        <Heart className="loading-heart" size={52} />
        <p>Preparando nuestro rinconcito…</p>
      </motion.main>
    );
  if (!configured && !demoMode)
    return (
      <main className="status-page">
        <Heart size={48} />
        <h1>Casi listo para nuestra historia</h1>
        <p>
          {configurationError ||
            "Falta conectar Supabase. Añade VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en Vercel y vuelve a desplegar."}
        </p>
        <span>Encontrarás todos los pasos en GUIA-DEPLOY.md.</span>
      </main>
    );
  if (error || !data)
    return (
      <main className="status-page">
        <Heart size={48} />
        <h1>Nuestros recuerdos vuelven enseguida</h1>
        <p role="alert">
          {error || "Todavía falta la configuración de nuestra historia."}
        </p>
        <button className="button" onClick={reload}>
          Volver a intentar
        </button>
      </main>
    );
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <a href="#historia" className="skip-link">
        Saltar a los recuerdos
      </a>
      <FondoCorazones />
      <header className="site-header">
        <a href="#inicio" className="brand">
          <span className="brand-icon">
            <Heart size={21} />
          </span>
          <span>
            nuestro <em>rinconcito</em>
            <small>UNA HISTORIA, DOS CORAZONES</small>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#historia">Nuestra historia</a>
          <a href="#galeria">Recuerdos</a>
          <a href="#cartas">Cartitas</a>
          <a href="#playlist" className="nav-playlist">
            <Music2 size={15} /> Nuestra música
          </a>
        </nav>
        <Heart className="header-heart" size={20} />
      </header>
      <main>
        <Hero config={data.config} momentos={data.momentos} />
        <Divider />
        <Timeline
          items={data.momentos}
          session={session}
          edit={edit}
          remove={remove}
        />
        <Divider />
        <Galeria items={data.momentos} />
        <Divider />
        <Cartas
          items={data.cartas}
          session={session}
          edit={edit}
          remove={remove}
        />
        <Divider />
        <Playlist
          items={data.canciones}
          session={session}
          edit={edit}
          remove={remove}
        />
        <section className="closing">
          <Reveal>
            <Heart className="closing-heart" size={35} />
            <span className="eyebrow">ESTO ES SOLO EL COMIENZO</span>
            <h2>
              Un mes. Mil sonrisas.
              <br />
              <em>Y todo lo que nos queda.</em>
            </h2>
            <p>
              Si volviera a empezar, volvería a elegirte.
              <br />
              Hoy, mañana y en todos nuestros días bonitos.
            </p>
            <button className="button love-button" onClick={celebrate}>
              Te amo <Heart size={20} />
            </button>
            <span className="closing-note">
              Por si hoy no te lo había dicho suficiente.
            </span>
          </Reveal>
        </section>
      </main>
      <footer className="site-footer">
        <span>Hecho con todo el amor del mundo.</span>
        <button
          className="footer-heart icon-button"
          aria-label="Nuestro corazón"
          title="Nuestro corazón"
          onClick={secretLogin}
        >
          <Heart size={19} />
        </button>
        <span>
          {data.config.nombre_uno} & {data.config.nombre_dos} · Desde{" "}
          {new Date(data.config.fecha_inicio).getFullYear()}
        </span>
      </footer>
      {demoMode && (
        <div className="demo-notice">
          <span>Vista de ejemplo · fotos y textos de muestra</span>
          <a href="#inicio">Tú harás la historia ♡</a>
        </div>
      )}
      {session && (
        <aside className="editing-bar" aria-label="Editar nuestra historia">
          <button onClick={() => edit("momentos")}>
            <Camera size={17} />
            <span>+ Momento</span>
          </button>
          <button onClick={() => edit("cartas")}>
            <Mail size={17} />
            <span>+ Carta</span>
          </button>
          <button onClick={() => edit("canciones")}>
            <Music2 size={17} />
            <span>+ Canción</span>
          </button>
          <button
            onClick={() => edit("config", data.config)}
            aria-label="Editar nombres y fecha"
          >
            <Settings2 size={18} />
          </button>
          <button onClick={logout} aria-label="Salir">
            <LogOut size={18} />
          </button>
        </aside>
      )}
      {login && <ModalLogin close={() => setLogin(false)} notify={setToast} />}
      {session && editor && (
        <Editor
          key={`${editor.table}-${editor.item?.id || "new"}`}
          target={editor}
          close={() => setEditor(null)}
          refresh={reload}
          notify={setToast}
        />
      )}
      {session && deletion && (
        <DeleteDialog
          target={deletion}
          close={() => setDeletion(null)}
          refresh={reload}
          notify={setToast}
        />
      )}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            style={{ x: "-50%" }}
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Heart size={18} />
            <span>{toast}</span>
            <button
              className="icon-button"
              aria-label="Cerrar aviso"
              onClick={() => setToast("")}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
export default App;
