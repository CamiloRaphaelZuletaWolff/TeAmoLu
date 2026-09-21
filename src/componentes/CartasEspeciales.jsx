import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarHeart,
  Heart,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Modal, Reveal } from "./UI";
import { useCartasEspeciales } from "../hooks/useCartasEspeciales";
import {
  TEMAS_FESTIVOS,
  CARTAS_FESTIVAS_INICIALES,
  cartaDisponible,
} from "../lib/festividades";
import { fechaBonita, hoyBolivia } from "../lib/fechas";
import {
  leerPlanificacion,
  guardarEspecial,
  eliminarEspecial,
} from "../lib/cartasEspeciales";
import "../estilos/festividades.css";

const temaDe = (key) => TEMAS_FESTIVOS[key] || TEMAS_FESTIVOS.amor;

function LluviaFestiva({ tema }) {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 9500);
    return () => clearTimeout(timer);
  }, []);
  if (!active) return null;
  const symbols = temaDe(tema).particulas;
  return (
    <div className="festival-rain" aria-hidden="true">
      {Array.from({ length: 44 }, (_, i) => (
        <motion.span
          key={i}
          className={i % 2 === 0 ? "festival-particle-large" : ""}
          style={{
            left: `${(i * 37 + 3) % 100}%`,
            fontSize: `${26 + ((i * 13) % 40)}px`,
          }}
          initial={{
            y: "-18vh",
            x: 0,
            rotate: ((i * 29) % 120) - 60,
            opacity: 0,
          }}
          animate={{
            y: "115vh",
            x: [0, (i % 2 ? -1 : 1) * (20 + (i % 45)), 0],
            rotate: (i % 2 ? -1 : 1) * 210,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4.7 + (i % 5) * 0.45,
            delay: (i % 9) * 0.22,
            ease: "linear",
          }}
        >
          {symbols[i % symbols.length]}
        </motion.span>
      ))}
    </div>
  );
}

function CartaAbierta({ carta, close }) {
  const reduced = useReducedMotion(),
    [burst, setBurst] = useState(0);
  const theme = temaDe(carta.tema);
  return (
    <Modal
      className={`festival-dialog festival-theme-${carta.tema}`}
      title={carta.titulo}
      onClose={close}
    >
      {!reduced && <LluviaFestiva key={burst} tema={carta.tema} />}
      <div className="festival-garden" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            style={{ "--flower-angle": `${(i % 2 ? -1 : 1) * (8 + i * 2)}deg` }}
          >
            {carta.tema === "girasoles"
              ? "🌻"
              : theme.particulas[i % theme.particulas.length]}
          </span>
        ))}
      </div>
      <div className="festival-reading">
        <motion.div
          className="festival-reading-tag"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span aria-hidden="true">{theme.simbolo}</span>
          {fechaBonita(carta.fecha)} · Bolivia
        </motion.div>
        <motion.article
          className="festival-letter"
          initial={
            reduced ? false : { opacity: 0, y: 65, rotate: -3, scale: 0.93 }
          }
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{
            duration: reduced ? 0 : 0.8,
            delay: reduced ? 0 : 0.22,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="festival-letter-flowers" aria-hidden="true">
            {theme.simbolo}
            <span>{theme.simbolo}</span>
            {theme.simbolo}
          </div>
          <span className="festival-kicker">{theme.etiqueta}</span>
          <h3>{carta.titulo}</h3>
          {carta.subtitulo && (
            <p className="festival-letter-subtitle">{carta.subtitulo}</p>
          )}
          <div className="festival-letter-body">{carta.contenido}</div>
          <p className="festival-signature">Con amor, {carta.autor}</p>
          <Heart className="festival-letter-heart" size={18} />
        </motion.article>
        {!reduced && (
          <button
            className="festival-replay"
            onClick={() => setBurst((previous) => previous + 1)}
          >
            <RotateCcw size={16} />
            {theme.accion}
          </button>
        )}
        <span className="festival-keepsake">
          Un día especial. Una cartita para siempre.
        </span>
      </div>
    </Modal>
  );
}

function CalendarioEspecial({ close, onEdit, ahora, onChange }) {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    leerPlanificacion()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await eliminarEspecial(deleting.id);
      setItems((previous) =>
        previous.filter((item) => item.id !== deleting.id),
      );
      setDeleting(null);
      await onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="Nuestro calendario de sorpresas"
      className="festival-manager"
      onClose={close}
      busy={busy}
    >
      <p>
        Prepara cada carta a tu ritmo. Se abrirá a las 00:00 de su fecha en
        Bolivia y se quedará en nuestro universo.
      </p>
      {loading && <p role="status">Buscando nuestros días especiales…</p>}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="festival-schedule">
        {items.map((item) => (
          <article
            className={`festival-scheduled festival-theme-${item.tema}`}
            key={item.id}
          >
            <span className="festival-scheduled-icon" aria-hidden="true">
              {temaDe(item.tema).simbolo}
            </span>
            <div>
              <h3>{item.titulo}</h3>
              <p>{fechaBonita(item.fecha)}</p>
              <span>
                {cartaDisponible(item, ahora || new Date())
                  ? "Ya forma parte de nuestro universo"
                  : "Programada · 00:00 de Bolivia"}
              </span>
            </div>
            <div className="festival-scheduled-actions">
              <button
                className="icon-button"
                disabled={busy}
                aria-label={`Personalizar ${item.titulo}`}
                onClick={() => onEdit(item)}
              >
                <Pencil size={17} />
              </button>
              <button
                className="icon-button"
                disabled={busy}
                aria-label={`Eliminar ${item.titulo}`}
                onClick={() => setDeleting(item)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && !items.length && (
        <p>Todavía no hay cartas especiales. Hagamos la primera.</p>
      )}
      {deleting && (
        <div
          className="festival-delete"
          role="group"
          aria-label="Confirmar eliminación"
        >
          <p>¿Eliminar «{deleting.titulo}»? No se puede deshacer.</p>
          <div className="dialog-actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Conservar
            </button>
            <button className="button" disabled={busy} onClick={remove}>
              {busy ? "Eliminando…" : "Eliminar carta"}
            </button>
          </div>
        </div>
      )}
      <button
        className="button full-width"
        disabled={busy || loading || Boolean(error)}
        onClick={() => onEdit({})}
      >
        <Plus size={17} />
        Añadir otro día especial
      </button>
    </Modal>
  );
}

function EditorEspecial({ item, close, onSaved }) {
  const [values, setValues] = useState(() => ({
    titulo: "Una sorpresa para ti",
    subtitulo: "Un día bonito para quererte",
    contenido: "Lu,\n\n",
    autor: "Toto",
    fecha: hoyBolivia(),
    tema: "amor",
    ...item,
  }));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const field = (key) => ({
    value: values[key],
    onChange: (event) =>
      setValues((previous) => ({ ...previous, [key]: event.target.value })),
  });
  function sugerencia() {
    const template = CARTAS_FESTIVAS_INICIALES.find(
      (carta) => carta.tema === values.tema,
    );
    if (template)
      setValues((previous) => ({
        ...previous,
        titulo: template.titulo,
        subtitulo: template.subtitulo,
        contenido: template.contenido,
      }));
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await guardarEspecial(values, item.id);
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={item.id ? "Una carta muy tuya" : "Otro día para celebrar"}
      onClose={close}
      className="festival-editor"
      busy={busy}
    >
      <form onSubmit={save}>
        <fieldset disabled={busy}>
          <div
            className={`festival-editor-preview festival-theme-${values.tema}`}
          >
            <span aria-hidden="true">{temaDe(values.tema).simbolo}</span>
            <span>{temaDe(values.tema).etiqueta}</span>
          </div>
          <label>
            Estilo de la carta
            <select {...field("tema")}>
              {Object.entries(TEMAS_FESTIVOS).map(([key, theme]) => (
                <option key={key} value={key}>
                  {theme.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            El día de la sorpresa
            <input type="date" {...field("fecha")} required />
          </label>
          <p className="field-help">
            Visible desde las 00:00 en Bolivia. Sin fecha de vencimiento.
          </p>
          <label>
            Título
            <input {...field("titulo")} required maxLength={140} />
          </label>
          <label>
            Dedicatoria corta
            <input {...field("subtitulo")} maxLength={200} />
          </label>
          <label>
            Tu carta
            <textarea
              {...field("contenido")}
              required
              rows={9}
              maxLength={20000}
            />
          </label>
          {values.tema !== "amor" && (
            <button className="text-button" type="button" onClick={sugerencia}>
              Usar el texto sugerido de esta temática
            </button>
          )}
          <label>
            Tu firma
            <input {...field("autor")} required maxLength={100} />
          </label>
        </fieldset>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button full-width" disabled={busy}>
          {busy ? "Guardando…" : "Guardar esta sorpresa"}
          <Heart size={17} />
        </button>
      </form>
    </Modal>
  );
}

export function CartasEspeciales() {
  const { cartas, loading, error, ahora, reload } = useCartasEspeciales();
  const [opened, setOpened] = useState(null),
    [manager, setManager] = useState(false),
    [editing, setEditing] = useState(null);
  const visibleOpened = cartas.find((item) => item.id === opened);
  return (
    <section className="section festivals-section" id="universo">
      <Reveal className="section-heading">
        <span className="eyebrow">
          03 <span>—</span> DÍAS PARA GUARDAR EN EL CORAZÓN
        </span>
        <h2>Nuestro pequeño universo</h2>
        <p>
          Hay fechas que merecen su propia cartita.
          <br />Y sorpresas que se quedan para siempre.
        </p>
      </Reveal>
      {loading && (
        <div className="festival-status" role="status">
          <span aria-hidden="true">🌻</span>Preparando nuestros días bonitos…
        </div>
      )}
      {error && (
        <div className="festival-status">
          <p role="alert">{error}</p>
          <button className="button secondary" onClick={reload}>
            Volver a intentar
          </button>
        </div>
      )}
      {!loading && !error && !cartas.length && (
        <div className="festival-status">
          <CalendarHeart size={30} />
          <p>
            Algunas sorpresas están esperando su día.
            <br />
            Cuando llegue, este rincón florecerá.
          </p>
        </div>
      )}
      {!error && (
        <div
          className={`festival-grid ${cartas.length === 1 ? "festival-grid-single" : ""}`}
        >
          {cartas.map((carta, index) => {
            const theme = temaDe(carta.tema);
            return (
              <Reveal key={carta.id} delay={(index % 4) * 0.08}>
                <button
                  className={`festival-card festival-theme-${carta.tema}`}
                  onClick={() => setOpened(carta.id)}
                  aria-label={`Abrir carta especial: ${carta.titulo}`}
                >
                  <span className="festival-card-date">
                    {fechaBonita(carta.fecha)}
                  </span>
                  <span className="festival-cover" aria-hidden="true">
                    <span className="festival-cover-flowers">
                      {theme.simbolo}
                      <span>{theme.simbolo}</span>
                      {theme.simbolo}
                    </span>
                    <span className="festival-mini-letter">
                      <span>Para Lu, con amor</span>
                      <span>{theme.simbolo}</span>
                    </span>
                    <span className="festival-cover-sprig">
                      {theme.simbolo}
                    </span>
                  </span>
                  <span className="festival-card-title">{carta.titulo}</span>
                  <span className="festival-card-subtitle">
                    {carta.subtitulo}
                  </span>
                  <span className="festival-card-open">
                    Abre tu sorpresa <ArrowUpRight size={16} />
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      )}
      <div className="festival-customize">
        <span>Una fecha llega. Su recuerdo se queda.</span>
        <button className="text-button" onClick={() => setManager(true)}>
          <Pencil size={14} />
          Personalizar fechas
        </button>
      </div>
      {visibleOpened && (
        <CartaAbierta carta={visibleOpened} close={() => setOpened(null)} />
      )}
      {manager && (
        <CalendarioEspecial
          close={() => setManager(false)}
          ahora={ahora}
          onChange={reload}
          onEdit={(item) => {
            setManager(false);
            setEditing(item);
          }}
        />
      )}
      {editing && (
        <EditorEspecial
          item={editing}
          close={() => {
            setEditing(null);
            setManager(true);
          }}
          onSaved={async () => {
            await reload();
            setEditing(null);
            setManager(true);
          }}
        />
      )}
    </section>
  );
}
