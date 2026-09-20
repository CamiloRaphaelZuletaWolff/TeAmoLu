import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Heart, Sparkles } from "lucide-react";
import { tiempoJuntos, fechaBonita } from "../lib/fechas";
import { imageUrl } from "../lib/imagenes";
import { Reveal } from "./UI";

function Contador({ start }) {
  const [now, setNow] = useState(new Date()),
    reduced = useReducedMotion();
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const values = tiempoJuntos(start, now);
  return (
    <div
      className="counter"
      role="group"
      aria-label="Tiempo que llevamos juntos"
    >
      {Object.entries(values).map(([label, value]) => (
        <div className="counter-cell" key={label}>
          <div className="counter-digit">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={value}
                initial={reduced ? false : { rotateX: -65, opacity: 0, y: -5 }}
                animate={{ rotateX: 0, opacity: 1, y: 0 }}
                exit={reduced ? undefined : { rotateX: 65, opacity: 0, y: 5 }}
                transition={{ duration: 0.18 }}
              >
                {String(value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="counter-label">
            {value === 1
              ? {
                  meses: "mes",
                  días: "día",
                  horas: "hora",
                  minutos: "minuto",
                  segundos: "segundo",
                }[label]
              : label}
          </span>
        </div>
      ))}
    </div>
  );
}
export function Hero({ config, momentos }) {
  const photos = momentos.filter((m) => m.imagen_path || m.demoImage);
  return (
    <section className="hero" id="inicio">
      <div className="hero-main">
        <Reveal className="hero-copy">
          <span className="anniversary-badge">
            <Sparkles size={14} /> NUESTRO TERCER MES
          </span>
          <h1>
            <span>{config.nombre_uno}</span>
            <Heart className="hero-heart" aria-label="y" />
            <span>{config.nombre_dos}</span>
          </h1>
          <h2>
            Qué bonito
            <br />
            coincidir <em>contigo.</em>
          </h2>
          <p className="hero-quote">
            {config.frase || "De todas las cosas bonitas, tú eres mi favorita."}
          </p>
          <a className="button" href="#historia">
            Nuestra historia <ArrowDown size={17} />
          </a>
          <p className="since">
            CON AMOR, DESDE EL{" "}
            {fechaBonita(config.fecha_inicio).toLocaleUpperCase("es")}
          </p>
        </Reveal>
        <Reveal className="hero-art" delay={0.16}>
          <span className="art-note">mi lugar favorito es contigo</span>
          {photos.length ? (
            <>
              <figure className="hero-polaroid">
                <span className="tape" />
                <img
                  src={photos[0].demoImage || imageUrl(photos[0].imagen_path)}
                  alt={photos[0].titulo}
                  fetchpriority="high"
                />
                <figcaption>
                  Tú, yo y todo lo bonito. <Heart size={15} />
                </figcaption>
              </figure>
              {photos[1] && (
                <figure className="little-polaroid">
                  <img
                    src={photos[1].demoImage || imageUrl(photos[1].imagen_path)}
                    alt={photos[1].titulo}
                  />
                  <figcaption>un instante, para siempre</figcaption>
                </figure>
              )}
              <span className="love-stamp" aria-hidden="true">
                HECHO CON
                <br />
                <Heart size={28} />
                <br />
                MUCHO AMOR
              </span>
            </>
          ) : (
            <div className="hero-no-photo">
              <Heart size={60} strokeWidth={1} />
              <p>
                Aquí empieza
                <br />
                <em>nuestra historia.</em>
              </p>
              <span>Tenemos tanto por recordar…</span>
            </div>
          )}
          <span className="art-sparkle" aria-hidden="true">
            ✧
          </span>
        </Reveal>
      </div>
      <Reveal className="time-together">
        <p>
          Y desde entonces, mi tiempo favorito es <em>contigo</em>
        </p>
        <Contador start={config.fecha_inicio} />
        <span className="time-footnote">
          … y contando momentos, no solo segundos. · Hora de Bolivia
        </span>
      </Reveal>
      <a
        className="scroll-cue"
        href="#historia"
        aria-label="Bajar a nuestra historia"
      >
        <ArrowDown size={20} />
      </a>
    </section>
  );
}
