import { useEffect, useRef, useState } from "react";
import { Heart, UploadCloud, ImagePlus, X } from "lucide-react";
import { supabase, demoMode } from "../lib/supabase";
import { imageUrl, uploadImage, removeImage } from "../lib/imagenes";
import { celebrate } from "../lib/confetti";
import { musicUrl } from "../lib/fechas";
import { Modal } from "./UI";

export function ModalLogin({ close, notify }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.get("email").trim(),
        password: form.get("password"),
      });
      if (error) throw error;
      notify("Qué lindo tenerte aquí. Ya puedes guardar recuerdos.");
      close();
    } catch {
      setError("No pudimos entrar. Revisa tu correo, contraseña y conexión.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Este rinconcito es nuestro" onClose={close} busy={busy}>
      <Heart className="modal-heart" />
      {demoMode ? (
        <p>
          Estás viendo una muestra local. Conecta tu proyecto de Supabase
          siguiendo GUIA-DEPLOY.md para entrar con tu cuenta y guardar sus
          recuerdos.
        </p>
      ) : (
        <form onSubmit={login}>
          <p>Entra para seguir escribiendo nuestra historia.</p>
          <label>
            Correo electrónico
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              maxLength={254}
            />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button full-width" disabled={busy}>
            {busy ? "Entrando…" : "Entrar con cariño"}
            <Heart size={16} />
          </button>
        </form>
      )}
    </Modal>
  );
}
function localDateTime(value) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function Editor({ target, close, refresh, notify }) {
  const { table, item = {} } = target;
  const [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [dragging, setDragging] = useState(false);
  const input = useRef(null);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function choose(selected) {
    if (!selected) return;
    if (
      !selected.type.startsWith("image/") ||
      selected.size > 25 * 1024 * 1024
    ) {
      setError("Elige una imagen de menos de 25 MB.");
      return;
    }
    setFile(selected);
    setRemovePhoto(false);
    setError("");
  }
  const titles = {
    momentos: item.id ? "Volvamos a este recuerdo" : "Un nuevo recuerdo",
    cartas: item.id ? "Un poquito más de amor" : "Una carta desde el corazón",
    canciones: item.id ? "Nuestra canción" : "Otra canción para nosotros",
    config: "Los protagonistas de esta historia",
  };
  async function save(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const text = (key) => String(form.get(key) || "").trim();
    let payload, newPath;
    let cleanupWarning = "";
    try {
      if (table === "momentos") {
        if (!text("titulo"))
          throw new Error("Escribe un título para este recuerdo.");
        newPath = file ? await uploadImage(file, setProgress) : null;
        payload = {
          titulo: text("titulo"),
          descripcion: text("descripcion"),
          fecha: text("fecha"),
          imagen_path:
            newPath || (removePhoto ? null : item.imagen_path || null),
        };
      } else if (table === "cartas") {
        if (!text("autor") || !text("contenido"))
          throw new Error("Escribe tu carta y añade tu firma.");
        payload = { autor: text("autor"), contenido: text("contenido") };
      } else if (table === "canciones") {
        if (!text("titulo"))
          throw new Error("Escribe el título de la canción.");
        if (text("url") && !musicUrl(text("url")))
          throw new Error("Usa un enlace HTTPS de Spotify o YouTube.");
        payload = {
          titulo: text("titulo"),
          artista: text("artista"),
          nota: text("nota"),
          url: text("url") || null,
        };
      } else {
        if (!text("nombre_uno") || !text("nombre_dos"))
          throw new Error("Escribe los dos nombres.");
        payload = {
          nombre_uno: text("nombre_uno"),
          nombre_dos: text("nombre_dos"),
          fecha_inicio: new Date(text("fecha_inicio")).toISOString(),
          frase: text("frase"),
        };
      }
      const query = item.id
        ? supabase.from(table).update(payload).eq("id", item.id)
        : supabase.from(table).insert(payload);
      const { error: saveError } = await query.select("id").single();
      if (saveError)
        throw new Error(
          "No se pudo guardar. Comprueba tu conexión y los permisos de tu cuenta.",
        );
      if (
        table === "momentos" &&
        item.imagen_path &&
        item.imagen_path !== payload.imagen_path
      ) {
        try {
          await removeImage(item.imagen_path);
        } catch {
          cleanupWarning =
            " El recuerdo se guardó, pero la foto anterior sigue en Storage. Puedes quitarla desde Supabase.";
        }
      }
      if (newPath || table === "cartas") celebrate();
      await refresh();
      notify(`Guardado con mucho amor.${cleanupWarning}`);
      close();
    } catch (err) {
      if (newPath) {
        try {
          await removeImage(newPath);
        } catch {
          cleanupWarning = ` La foto subida (${newPath}) quedó sin asociar; puedes borrarla en Storage.`;
        }
      }
      setError(
        `${err.message || "No se pudo guardar. Inténtalo de nuevo."}${cleanupWarning}`,
      );
    } finally {
      setBusy(false);
    }
  }
  const shownPhoto = preview || (!removePhoto && imageUrl(item.imagen_path));
  return (
    <Modal title={titles[table]} onClose={close} busy={busy}>
      <form onSubmit={save}>
        <fieldset disabled={busy}>
          {table === "momentos" && (
            <>
              <label>
                Título
                <input
                  name="titulo"
                  defaultValue={item.titulo}
                  required
                  maxLength={120}
                  autoFocus
                  placeholder="Ese día que nunca quiero olvidar"
                />
              </label>
              <label>
                Fecha
                <input
                  name="fecha"
                  type="date"
                  defaultValue={
                    item.fecha || localDateTime(new Date()).slice(0, 10)
                  }
                  required
                />
              </label>
              <label>
                Cuéntanos el recuerdo
                <textarea
                  name="descripcion"
                  defaultValue={item.descripcion}
                  rows={3}
                  maxLength={5000}
                  placeholder="Lo que hizo especial ese momento…"
                />
              </label>
              <label>Una foto, mil recuerdos</label>
              <div
                className={`upload-area ${dragging ? "dragging" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!busy) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  if (!busy) choose(event.dataTransfer.files[0]);
                }}
              >
                {shownPhoto ? (
                  <img
                    className="upload-preview"
                    src={shownPhoto}
                    alt="Vista previa de la foto elegida"
                  />
                ) : (
                  <ImagePlus size={30} />
                )}
                <button
                  className="text-button"
                  type="button"
                  onClick={() => input.current.click()}
                >
                  <UploadCloud size={18} />
                  {shownPhoto ? "Cambiar foto" : "Elegir una foto"}
                </button>
                <span>o arrástrala aquí · hasta 25 MB</span>
                <input
                  ref={input}
                  type="file"
                  accept="image/*"
                  aria-label="Seleccionar foto"
                  onChange={(event) => choose(event.target.files[0])}
                  className="file-input"
                />
                {shownPhoto && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setFile(null);
                      setRemovePhoto(true);
                      input.current.value = "";
                    }}
                  >
                    <X size={14} /> Quitar foto
                  </button>
                )}
              </div>
              {busy && file && (
                <div className="upload-progress">
                  <progress
                    max="100"
                    value={progress}
                    aria-label="Preparación y subida de la foto"
                  />
                  <span>
                    {progress < 85
                      ? "Preparando foto"
                      : progress < 100
                        ? "Subiendo foto"
                        : "Guardando recuerdo"}
                    …
                  </span>
                </div>
              )}
            </>
          )}
          {table === "cartas" && (
            <>
              <label>
                Tu carta
                <textarea
                  name="contenido"
                  defaultValue={item.contenido}
                  required
                  rows={9}
                  maxLength={20000}
                  autoFocus
                  placeholder="Hay algo que quiero decirte…"
                />
              </label>
              <label>
                Tu firma
                <input
                  name="autor"
                  defaultValue={item.autor}
                  required
                  maxLength={100}
                  placeholder="Con amor, yo"
                />
              </label>
            </>
          )}
          {table === "canciones" && (
            <>
              <label>
                Canción
                <input
                  name="titulo"
                  defaultValue={item.titulo}
                  required
                  maxLength={150}
                  autoFocus
                />
              </label>
              <label>
                Artista
                <input
                  name="artista"
                  defaultValue={item.artista}
                  maxLength={150}
                />
              </label>
              <label>
                Enlace de Spotify o YouTube
                <input
                  name="url"
                  type="url"
                  defaultValue={item.url}
                  maxLength={2000}
                  placeholder="https://open.spotify.com/track/…"
                />
              </label>
              <label>
                ¿Por qué te recuerda a nosotros?
                <textarea
                  name="nota"
                  rows={3}
                  defaultValue={item.nota}
                  maxLength={1000}
                />
              </label>
            </>
          )}
          {table === "config" && (
            <>
              <label>
                Tu nombre
                <input
                  name="nombre_uno"
                  defaultValue={item.nombre_uno}
                  required
                  maxLength={40}
                  autoFocus
                />
              </label>
              <label>
                Su nombre
                <input
                  name="nombre_dos"
                  defaultValue={item.nombre_dos}
                  required
                  maxLength={40}
                />
              </label>
              <label>
                El día y la hora en que empezó todo
                <input
                  name="fecha_inicio"
                  type="datetime-local"
                  defaultValue={localDateTime(item.fecha_inicio)}
                  required
                />
              </label>
              <p className="field-help">
                Se usa la zona horaria de este dispositivo.
              </p>
              <label>
                Su frase
                <input name="frase" defaultValue={item.frase} maxLength={240} />
              </label>
            </>
          )}
        </fieldset>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button full-width" disabled={busy}>
          {busy ? "Guardando…" : "Guardar este pedacito de nosotros"}
          <Heart size={16} />
        </button>
      </form>
    </Modal>
  );
}

export function DeleteDialog({ target, close, refresh, notify }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function remove() {
    setBusy(true);
    setError("");
    try {
      const { error, data } = await supabase
        .from(target.table)
        .delete()
        .eq("id", target.item.id)
        .select("id");
      if (error || !data?.length)
        throw new Error(
          "No se pudo eliminar. Comprueba tu conexión y tu sesión.",
        );
      let warning = "";
      if (target.table === "momentos" && target.item.imagen_path) {
        try {
          await removeImage(target.item.imagen_path);
        } catch {
          warning = ` La foto ${target.item.imagen_path} sigue en Storage; elimínala desde Supabase.`;
        }
      }
      await refresh();
      notify(`Eliminado.${warning}`);
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="¿Lo quitamos de nuestro rincón?" onClose={close} busy={busy}>
      <p>
        Se eliminará{" "}
        {target.item.titulo
          ? `«${target.item.titulo}»`
          : `la carta de ${target.item.autor}`}
        {target.item.imagen_path ? " y su foto" : ""}. Esta acción no se puede
        deshacer.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button className="button secondary" onClick={close} disabled={busy}>
          Conservar
        </button>
        <button className="button" onClick={remove} disabled={busy}>
          {busy ? "Eliminando…" : "Sí, eliminar"}
        </button>
      </div>
    </Modal>
  );
}
