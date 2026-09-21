import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { readLocal, saveLocal, deleteLocal } from "../src/lib/localStore.js";
import { cartasDisponibles } from "../src/lib/festividades.js";

test("el álbum inicial usa Toto, Lu y el 20 de junio a medianoche de Bolivia", async () => {
  const data = await readLocal();
  assert.equal(data.config.nombre_uno, "Toto");
  assert.equal(data.config.nombre_dos, "Lu");
  assert.equal(data.config.fecha_inicio, "2026-06-20T00:00:00-04:00");
  assert.deepEqual(data.fotos, []);
  assert.equal("canciones" in data, false);
});
test("crea, vuelve a leer, edita y elimina una carta sin sesión", async () => {
  const saved = await saveLocal("cartas", {
    autor: "Toto",
    contenido: "Para Lu",
  });
  assert.equal(
    (await readLocal()).cartas.find((c) => c.id === saved.id).contenido,
    "Para Lu",
  );
  await saveLocal("cartas", { contenido: "Te amo Lu" }, saved.id);
  assert.equal(
    (await readLocal()).cartas.find((c) => c.id === saved.id).autor,
    "Toto",
  );
  assert.equal(
    (await readLocal()).cartas.find((c) => c.id === saved.id).contenido,
    "Te amo Lu",
  );
  await deleteLocal("cartas", saved.id);
  assert.equal(
    (await readLocal()).cartas.some((c) => c.id === saved.id),
    false,
  );
});
test("varias fotos persisten sin perderse entre transacciones y sin llenar la historia", async () => {
  const before = await readLocal();
  const records = await Promise.all(
    [1, 2, 3].map((i) =>
      saveLocal("fotos", {
        titulo: `Foto ${i}`,
        fecha: "2026-09-20",
        imagen_path: "data:image/webp;base64,UklGRg==",
      }),
    ),
  );
  const after = await readLocal();
  for (const record of records)
    assert.ok(
      after.fotos.some(
        (f) => f.id === record.id && f.imagen_path.startsWith("data:image/"),
      ),
    );
  assert.equal(after.momentos.length, before.momentos.length);
  for (const record of records) await deleteLocal("fotos", record.id);
  assert.equal((await readLocal()).fotos.length, before.fotos.length);
});
test("configuración editada persiste sin reemplazar las cartas", async () => {
  const before = await readLocal();
  await saveLocal("config", { frase: "Siempre tú" }, 1);
  const after = await readLocal();
  assert.equal(after.config.frase, "Siempre tú");
  assert.equal(after.config.fecha_inicio, "2026-06-20T00:00:00-04:00");
  assert.deepEqual(after.cartas, before.cartas);
});

test("las fiestas se incorporan al borrador previo sin perder contenido", async () => {
  const before = await readLocal();
  assert.equal(before.cartas_especiales.length, 4);
  const september = before.cartas_especiales.find(
    (c) => c.tema === "girasoles",
  );
  await saveLocal(
    "cartas_especiales",
    { contenido: "Girasoles de Toto para Lu" },
    september.id,
  );
  const after = await readLocal();
  assert.equal(
    after.cartas_especiales.find((c) => c.id === september.id).contenido,
    "Girasoles de Toto para Lu",
  );
  assert.deepEqual(after.cartas, before.cartas);
  assert.deepEqual(after.momentos, before.momentos);
  assert.deepEqual(after.fotos, before.fotos);
  assert.equal(
    cartasDisponibles(after.cartas_especiales, "2026-09-21T04:00:00Z").length,
    1,
  );
});

test("una fiesta personalizada persiste y una eliminada no reaparece al leer", async () => {
  const record = await saveLocal("cartas_especiales", {
    tema: "amor",
    fecha: "2027-02-14",
    titulo: "Otra fecha",
    contenido: "Para Lu",
    autor: "Toto",
    subtitulo: "",
  });
  assert.ok(
    (await readLocal()).cartas_especiales.some((c) => c.id === record.id),
  );
  await deleteLocal("cartas_especiales", record.id);
  assert.equal(
    (await readLocal()).cartas_especiales.some((c) => c.id === record.id),
    false,
  );
  const halloween = (await readLocal()).cartas_especiales.find(
    (c) => c.tema === "halloween",
  );
  await deleteLocal("cartas_especiales", halloween.id);
  assert.equal(
    (await readLocal()).cartas_especiales.some((c) => c.id === halloween.id),
    false,
  );
});
