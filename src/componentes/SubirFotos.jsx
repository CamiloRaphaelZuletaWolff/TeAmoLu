import { useEffect, useRef, useState } from "react";
import { Camera, UploadCloud, X } from "lucide-react";
import { Modal } from "./UI";
import { uploadImage, removeImage } from "../lib/imagenes";
import { saveRecord } from "../lib/contenido";
import { hoyBolivia } from "../lib/fechas";
import { celebrate } from "../lib/confetti";

export function SubirFotos({ close, refresh, notify }) {
  const [files, setFiles] = useState([]),
    [previews, setPreviews] = useState({});
  const [date, setDate] = useState(hoyBolivia),
    [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const [status, setStatus] = useState(""),
    [dragging, setDragging] = useState(false);
  const input = useRef(null);
  useEffect(() => {
    const urls = Object.fromEntries(
      files.map((item) => [item.id, URL.createObjectURL(item.file)]),
    );
    setPreviews(urls);
    return () => Object.values(urls).forEach(URL.revokeObjectURL);
  }, [files]);
  function choose(list) {
    if (busy) return;
    const valid = [],
      invalid = [];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith("image/") || file.size > 25 * 1024 * 1024) {
        invalid.push(file.name);
        continue;
      }
      valid.push({
        id: crypto.randomUUID(),
        file,
        titulo: file.name.replace(/\.[^.]+$/, "").slice(0, 120),
      });
    }
    setFiles((previous) => [
      ...previous,
      ...valid.filter(
        (item) =>
          !previous.some(
            (p) =>
              p.file.name === item.file.name &&
              p.file.size === item.file.size &&
              p.file.lastModified === item.file.lastModified,
          ),
      ),
    ]);
    setError(
      invalid.length
        ? `Estas no se añadieron: ${invalid.join(", ")}. Elige imágenes de hasta 25 MB cada una.`
        : "",
    );
    if (input.current) input.current.value = "";
  }
  async function save(event) {
    event.preventDefault();
    if (!files.length || busy) return;
    setBusy(true);
    setError("");
    setProgress(0);
    const saved = [],
      failed = [];
    for (let index = 0; index < files.length; index++) {
      const item = files[index];
      let path;
      setStatus(`Guardando foto ${index + 1} de ${files.length}…`);
      try {
        path = await uploadImage(item.file, (amount) =>
          setProgress(((index + amount / 100) / files.length) * 100),
        );
        await saveRecord("fotos", {
          titulo: item.titulo.trim() || "Toto y Lu",
          fecha: date,
          imagen_path: path,
        });
        saved.push(item.id);
      } catch (err) {
        let cleanup = "";
        if (path) {
          try {
            await removeImage(path);
          } catch {
            cleanup = " Quedó una imagen sin asociar en Storage.";
          }
        }
        failed.push(`${item.file.name}: ${err.message}${cleanup}`);
      }
    }
    setFiles((previous) => previous.filter((item) => !saved.includes(item.id)));
    setBusy(false);
    setStatus("");
    setProgress(0);
    if (saved.length) {
      await refresh();
      celebrate();
      notify(
        `${saved.length} ${saved.length === 1 ? "foto guardada" : "fotos guardadas"} en nuestro álbum. ♡`,
      );
    }
    if (failed.length)
      setError(
        `Estas fotos no se guardaron; puedes reintentarlo sin duplicar las demás. ${failed.join(" ")}`,
      );
    else close();
  }
  return (
    <Modal
      title="Más fotos de nosotros"
      className="photos-modal"
      onClose={close}
      busy={busy}
    >
      <form onSubmit={save}>
        <p>
          Esos días que queremos volver a vivir. Puedes elegir varias fotos a la
          vez.
        </p>
        <fieldset disabled={busy}>
          <div
            className={`upload-area ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!busy) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              choose(e.dataTransfer.files);
            }}
          >
            <Camera size={32} />
            <button
              type="button"
              className="text-button"
              onClick={() => input.current.click()}
            >
              <UploadCloud size={18} />
              Elegir fotos
            </button>
            <span>o arrástralas aquí · hasta 25 MB por foto</span>
            <input
              ref={input}
              type="file"
              multiple
              accept="image/*"
              className="file-input"
              aria-label="Seleccionar varias fotos"
              onChange={(e) => choose(e.target.files)}
            />
          </div>
          {files.length > 0 && (
            <>
              <label>
                Fecha de estos recuerdos
                <input
                  type="date"
                  value={date}
                  required
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <p className="field-help">
                Fecha en Bolivia · puedes cambiarla antes de guardar.
              </p>
              <div className="photo-upload-list">
                {files.map((item) => (
                  <div className="photo-upload-item" key={item.id}>
                    <img src={previews[item.id]} alt={item.file.name} />
                    <label>
                      Un nombre para esta foto
                      <input
                        value={item.titulo}
                        maxLength={120}
                        onChange={(e) =>
                          setFiles((previous) =>
                            previous.map((p) =>
                              p.id === item.id
                                ? { ...p, titulo: e.target.value }
                                : p,
                            ),
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Quitar ${item.file.name} de la selección`}
                      onClick={() =>
                        setFiles((previous) =>
                          previous.filter((p) => p.id !== item.id),
                        )
                      }
                    >
                      <X size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </fieldset>
        {busy && (
          <div className="upload-progress">
            <progress
              value={progress}
              max="100"
              aria-label="Progreso de las fotos"
            />
            <span role="status">{status}</span>
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button full-width" disabled={busy || !files.length}>
          {busy
            ? "Guardando nuestros recuerdos…"
            : `Guardar ${files.length || ""} ${files.length === 1 ? "foto" : "fotos"}`}
          <Camera size={17} />
        </button>
      </form>
    </Modal>
  );
}
