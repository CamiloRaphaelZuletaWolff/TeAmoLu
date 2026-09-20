import { demoData } from "./demo.js";

let database;
function openLocal() {
  database ||= new Promise((resolve, reject) => {
    const request = indexedDB.open("te-amo-lu", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("contenido");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      database = null;
      reject(
        new Error(
          "No se pudo abrir el guardado local. Permite el almacenamiento del navegador.",
        ),
      );
    };
  });
  return database;
}
async function transaction(change) {
  const db = await openLocal();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("contenido", change ? "readwrite" : "readonly");
    const store = tx.objectStore("contenido");
    const request = store.get("album");
    let result;
    request.onsuccess = () => {
      result = request.result || structuredClone(demoData);
      if (change) {
        change(result);
        store.put(result, "album");
      }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = tx.onerror = () =>
      reject(
        new Error(
          "No se pudo guardar. Comprueba el espacio disponible en este navegador.",
        ),
      );
  });
}
export const readLocal = () => transaction();
export async function saveLocal(table, payload, id) {
  const record = { ...payload, id: id || crypto.randomUUID() };
  await transaction((data) => {
    if (table === "config") {
      data.config = { ...data.config, ...record };
      return;
    }
    const index = data[table].findIndex((item) => item.id === id);
    if (index >= 0) data[table][index] = { ...data[table][index], ...record };
    else
      data[table].unshift({ ...record, created_at: new Date().toISOString() });
    if (table === "momentos")
      data.momentos.sort((a, b) => a.fecha.localeCompare(b.fecha));
  });
  return record;
}
export const deleteLocal = (table, id) =>
  transaction((data) => {
    data[table] = data[table].filter((item) => item.id !== id);
  });
