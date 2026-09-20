import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Maximize2 } from "lucide-react";
import { fechaBonita } from "../lib/fechas";
import { imageUrl } from "../lib/imagenes";
import { Reveal, SectionTitle, EditActions, Empty, Modal } from "./UI";
export const photoSrc = (item) => item.demoImage || imageUrl(item.imagen_path);
export function Timeline({ items, edit, remove }) {
  const ref = useRef(null),
    reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 65%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <section className="section" id="historia" ref={ref}>
      <SectionTitle
        number="01"
        title="Así empezó lo nuestro"
        subtitle="Hay días que se quedan para siempre. Estos son los nuestros."
      />
      {items.length ? (
        <div className="timeline">
          <div className="timeline-track" />
          <motion.div
            className="timeline-progress"
            style={{ scaleY: reduced ? 1 : scaleY }}
          />
          {items.map((item, index) => (
            <Reveal
              className={`timeline-item ${index % 2 ? "right" : "left"}`}
              key={item.id}
              delay={(index % 3) * 0.08}
            >
              <span className="timeline-dot">
                <Heart size={12} />
              </span>
              <article className="moment-card">
                <span className="eyebrow">{fechaBonita(item.fecha)}</span>
                <h3>{item.titulo}</h3>
                <p>{item.descripcion}</p>
                {photoSrc(item) && (
                  <img loading="lazy" src={photoSrc(item)} alt={item.titulo} />
                )}
                <span className="moment-number" aria-hidden="true">
                  0{index + 1}
                </span>
                {
                  <EditActions
                    label={item.titulo}
                    onEdit={() => edit("momentos", item)}
                    onDelete={() => remove("momentos", item)}
                  />
                }
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        <Empty>
          El primer recuerdo está por llegar. Qué bonito empezar juntos.
        </Empty>
      )}
    </section>
  );
}
export function Galeria({ items, upload, edit, remove }) {
  const photos = items.filter((item) => photoSrc(item)),
    [selected, setSelected] = useState(null);
  const reduced = useReducedMotion();
  const touchStart = useRef(null);
  const navigate = (direction) =>
    setSelected(
      (previous) => (previous + direction + photos.length) % photos.length,
    );
  return (
    <section className="section gallery-section" id="galeria">
      <SectionTitle
        number="02"
        title="Todas nuestras fotos"
        subtitle="Si la felicidad fuera una foto, se parecería a estas."
      />
      <div className="section-actions">
        <button className="button" onClick={upload}>
          Subir nuestras fotos <Heart size={17} />
        </button>
        <span>{photos.length} recuerdos en nuestro álbum</span>
      </div>
      {photos.length ? (
        <div className="gallery">
          {photos.map((item, index) => (
            <Reveal key={item.id} delay={(index % 4) * 0.08}>
              <button
                className="polaroid"
                style={{ "--rotation": `${[-3, 2, -1, 3][index % 4]}deg` }}
                onClick={() => setSelected(index)}
                aria-label={`Ampliar foto: ${item.titulo}`}
              >
                <motion.img
                  layoutId={reduced ? undefined : `photo-${item.id}`}
                  src={photoSrc(item)}
                  alt={item.titulo}
                  loading="lazy"
                />
                <span className="zoom-hint">
                  <Maximize2 size={18} />
                </span>
                <span className="photo-caption">
                  {item.titulo} <Heart size={13} />
                </span>
                <span className="photo-date">{fechaBonita(item.fecha)}</span>
              </button>
              <EditActions
                label={item.titulo}
                onEdit={() => edit(item._table || "momentos", item)}
                onDelete={() => remove(item._table || "momentos", item)}
              />
            </Reveal>
          ))}
        </div>
      ) : (
        <Empty>Un álbum listo para llenarse de nosotros.</Empty>
      )}
      <AnimatePresence>
        {selected !== null && photos[selected] && (
          <Modal
            className="lightbox"
            title="Un recuerdo para guardar"
            onClose={() => setSelected(null)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                navigate(event.key === "ArrowLeft" ? -1 : 1);
              }
            }}
          >
            <div className="lightbox-inner">
              <motion.img
                key={photos[selected].id}
                layoutId={reduced ? undefined : `photo-${photos[selected].id}`}
                src={photoSrc(photos[selected])}
                alt={photos[selected].titulo}
                drag={reduced ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_event, info) => {
                  if (info.offset.x > 50) navigate(-1);
                  if (info.offset.x < -50) navigate(1);
                }}
                onTouchStart={(event) => {
                  if (reduced) touchStart.current = event.touches[0].clientX;
                }}
                onTouchEnd={(event) => {
                  if (!reduced || touchStart.current === null) return;
                  const distance =
                    event.changedTouches[0].clientX - touchStart.current;
                  if (Math.abs(distance) > 50) navigate(distance > 0 ? -1 : 1);
                  touchStart.current = null;
                }}
              />
              <div className="lightbox-nav">
                <button
                  className="icon-button"
                  aria-label="Foto anterior"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft />
                </button>
                <div>
                  <p>{photos[selected].titulo}</p>
                  <span>
                    {selected + 1} / {photos.length}
                  </span>
                </div>
                <button
                  className="icon-button"
                  aria-label="Foto siguiente"
                  onClick={() => navigate(1)}
                >
                  <ArrowRight />
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}
