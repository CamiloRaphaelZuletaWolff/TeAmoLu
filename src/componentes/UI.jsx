import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Heart, Pencil, Trash2 } from "lucide-react";

export function Reveal({ children, className = "", delay = 0, ...props }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
export function SectionTitle({ number, title, subtitle }) {
  return (
    <Reveal className="section-heading">
      <span className="eyebrow">
        {number} <span>—</span> NUESTRO PEQUEÑO UNIVERSO
      </span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </Reveal>
  );
}
export function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span />
      <Heart size={14} />
      <span />
    </div>
  );
}
export function EditActions({ onEdit, onDelete, label }) {
  return (
    <div className="edit-actions">
      <button
        className="icon-button"
        aria-label={`Editar ${label}`}
        onClick={onEdit}
      >
        <Pencil size={16} />
      </button>
      <button
        className="icon-button"
        aria-label={`Eliminar ${label}`}
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  className = "",
  busy = false,
  onKeyDown,
}) {
  const ref = useRef(null),
    previousFocus = useRef(null);
  useEffect(() => {
    previousFocus.current = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = oldOverflow;
      previousFocus.current?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-label={title}
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !busy) onClose();
      }}
    >
      <div className="modal-content">
        <button
          className="icon-button modal-close"
          aria-label="Cerrar"
          disabled={busy}
          onClick={onClose}
        >
          <X size={22} />
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
export function Empty({ children }) {
  return (
    <div className="empty">
      <Heart size={24} />
      <p>{children}</p>
    </div>
  );
}
