import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Mail, Settings2, X, ImagePlus } from "lucide-react";
import { configured, demoMode, configurationError } from "./lib/supabase";
import { celebrate } from "./lib/confetti";
import { fechaHoraBolivia } from "./lib/fechas";
import { useContenido } from "./hooks/useContenido";
import { Hero } from "./componentes/Hero";
import { Galeria } from "./componentes/Recuerdos";
import { Cartas } from "./componentes/Cartas";
import { Divider, Reveal } from "./componentes/UI";
import { Editor, DeleteDialog } from "./componentes/Edicion";
import { SubirFotos } from "./componentes/SubirFotos";
import { CartasEspeciales } from "./componentes/CartasEspeciales";

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
export default function App() {
  const { data, error, loading, reload } = useContenido();
  const [editor, setEditor] = useState(null),
    [deletion, setDeletion] = useState(null),
    [upload, setUpload] = useState(false),
    [toast, setToast] = useState("");
  const [loaderVisible, setLoaderVisible] = useState(true),
    reduced = useReducedMotion();
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => setLoaderVisible(false), reduced ? 0 : 350);
    return () => clearTimeout(timer);
  }, [loading, reduced]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 10000);
    return () => clearTimeout(timer);
  }, [toast]);
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
        <p>Preparando algo bonito para Lu…</p>
      </motion.main>
    );
  if (!configured && !demoMode)
    return (
      <main className="status-page">
        <Heart size={48} />
        <h1>Casi listo para nuestra historia</h1>
        <p>
          {configurationError ||
            "Falta conectar Supabase. Añade SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY en Vercel y vuelve a desplegar. También se aceptan los nombres con VITE_ al principio."}
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
  const album = [
    ...data.fotos.map((item) => ({ ...item, _table: "fotos" })),
    ...data.momentos.map((item) => ({ ...item, _table: "momentos" })),
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <a href="#universo" className="skip-link">
        Saltar a nuestro universo
      </a>
      <FondoCorazones />
      <header className="site-header">
        <a href="#inicio" className="brand">
          <span className="brand-icon">
            <Heart size={21} />
          </span>
          <span>
            te amo <em>lu</em>
            <small>TOTO & LU · NUESTRO TERCER MES</small>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#universo">Nuestro universo</a>
          <a href="#galeria">Nuestras fotos</a>
          <a href="#cartas">Cartitas</a>
        </nav>
        <Heart className="header-heart" size={20} />
      </header>
      <main>
        <Hero config={data.config} momentos={album} />
        <Divider />
        <CartasEspeciales />
        <Divider />
        <Galeria
          items={album}
          upload={() => setUpload(true)}
          edit={edit}
          remove={remove}
        />
        <Divider />
        <Cartas items={data.cartas} edit={edit} remove={remove} />
        <section className="closing">
          <Reveal>
            <Heart className="closing-heart" size={35} />
            <span className="eyebrow">NUESTRO TERCER MES JUNTOS</span>
            <h2>
              Tres meses. Mil sonrisas.
              <br />
              <em>Y todo lo que nos queda.</em>
            </h2>
            <p>
              Si volviera a empezar, volvería a elegirte, Lu.
              <br />
              Hoy, mañana y en todos nuestros días bonitos.
            </p>
            <button className="button love-button" onClick={celebrate}>
              Te amo Lu <Heart size={20} />
            </button>
            <span className="closing-note">Con todo mi amor, Toto.</span>
          </Reveal>
        </section>
      </main>
      <footer className="site-footer">
        <span>Hecho con todo el amor de Toto para Lu.</span>
        <Heart className="footer-heart" size={19} />
        <span>
          {data.config.nombre_uno} & {data.config.nombre_dos} · Desde{" "}
          {fechaHoraBolivia(data.config.fecha_inicio).slice(0, 4)} · Bolivia
        </span>
      </footer>
      {demoMode && (
        <div className="demo-notice">
          <span>
            Guardado en este navegador · las fotos iniciales son de ejemplo
          </span>
          <span>
            Con Supabase podrás compartir tus cambios entre dispositivos.
          </span>
        </div>
      )}
      <aside className="editing-bar" aria-label="Crear nuevos recuerdos">
        <button onClick={() => setUpload(true)}>
          <ImagePlus size={17} />
          <span>+ Fotos</span>
        </button>
        <button onClick={() => edit("cartas")}>
          <Mail size={17} />
          <span>+ Cartita</span>
        </button>
        <button
          onClick={() => edit("config", data.config)}
          aria-label="Editar nombres y fecha"
        >
          <Settings2 size={18} />
        </button>
      </aside>
      {editor && (
        <Editor
          key={`${editor.table}-${editor.item?.id || "new"}`}
          target={editor}
          close={() => setEditor(null)}
          refresh={reload}
          notify={setToast}
        />
      )}
      {deletion && (
        <DeleteDialog
          target={deletion}
          close={() => setDeletion(null)}
          refresh={reload}
          notify={setToast}
        />
      )}
      {upload && (
        <SubirFotos
          close={() => setUpload(false)}
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
