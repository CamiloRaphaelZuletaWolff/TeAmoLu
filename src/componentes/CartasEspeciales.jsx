import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarHeart,
  Heart,
  RotateCcw,
} from "lucide-react";
import { Modal, Reveal } from "./UI";
import { useCartasEspeciales } from "../hooks/useCartasEspeciales";
import { TEMAS_FESTIVOS } from "../lib/festividades";
import { fechaBonita } from "../lib/fechas";
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
          {fechaBonita(carta.fecha)}
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

export function CartasEspeciales() {
  const { cartas, loading, error, reload } = useCartasEspeciales();
  const [opened, setOpened] = useState(null);
  const visibleOpened = cartas.find((item) => item.id === opened);
  return (
    <section className="section festivals-section" id="universo">
      <Reveal className="section-heading">
        <span className="eyebrow">
          01 <span>—</span> DÍAS PARA GUARDAR EN EL CORAZÓN
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
                      <span>
                        {carta.clave === "girasoles-2026"
                          ? "Para mi princesa hermosa"
                          : "Para Lu, con amor"}
                      </span>
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
      </div>
      {visibleOpened && (
        <CartaAbierta carta={visibleOpened} close={() => setOpened(null)} />
      )}
    </section>
  );
}
