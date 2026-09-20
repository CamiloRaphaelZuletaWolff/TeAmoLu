import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { Reveal, SectionTitle, EditActions, Empty, Modal } from "./UI";
import { fechaBonita, fechaConHora } from "../lib/fechas";
export function Cartas({ items, edit, remove }) {
  const [opened, setOpened] = useState(null),
    reduced = useReducedMotion();
  return (
    <section className="section letters-section" id="cartas">
      <SectionTitle
        number="03"
        title="Hay cosas que quiero decirte"
        subtitle="Palabras que se quedan cortas, pero que salen del corazón."
      />
      <div className="section-actions">
        <button className="button" onClick={() => edit("cartas")}>
          Escribir una cartita <Heart size={17} />
        </button>
      </div>
      {items.length ? (
        <div className="letters-grid">
          {items.map((item, index) => (
            <Reveal
              key={item.id}
              delay={(index % 3) * 0.08}
              className="letter-item"
            >
              <button
                className="envelope"
                onClick={() => setOpened(item)}
                aria-label={`Abrir carta de ${item.autor}`}
              >
                <span className="envelope-paper">Para ti, siempre.</span>
                <span className="envelope-flap" />
                <span className="envelope-front" />
                <span className="wax-seal">
                  <Heart size={24} />
                </span>
                <span className="envelope-to">Para mi persona favorita</span>
              </button>
              <div className="letter-caption">
                <h3>
                  Una carta para ti <Heart size={15} />
                </h3>
                <span>{fechaConHora(item.created_at)} · Bolivia</span>
              </div>
              {
                <EditActions
                  label={`carta de ${item.autor}`}
                  onEdit={() => edit("cartas", item)}
                  onDelete={() => remove("cartas", item)}
                />
              }
            </Reveal>
          ))}
        </div>
      ) : (
        <Empty>Hay palabras bonitas esperando su momento.</Empty>
      )}
      <p className="section-note">
        Un sobre, un pedacito de mi corazón. Toca para abrirlo.
      </p>
      {opened && (
        <Modal
          className="letter-modal"
          title="Para ti, con amor"
          onClose={() => setOpened(null)}
        >
          <motion.div
            className="opened-flap"
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -180 }}
            transition={{ duration: reduced ? 0 : 0.65 }}
          />
          <motion.article
            className="letter-paper"
            initial={reduced ? false : { y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.2, duration: 0.6 }}
          >
            <Heart className="letter-heart" size={26} />
            <p className="letter-salutation">Mi amor,</p>
            <div className="letter-text">{opened.contenido}</div>
            <p className="signature">{opened.autor}</p>
            <span className="letter-date">
              {fechaConHora(opened.created_at)} · Bolivia
            </span>
          </motion.article>
        </Modal>
      )}
    </section>
  );
}
