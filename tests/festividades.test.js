import test from "node:test";
import assert from "node:assert/strict";
import {
  CARTAS_FESTIVAS_INICIALES as cartas,
  cartasDisponibles,
  cartaDisponible,
  hastaMedianocheBolivia,
  prepararCartaEspecial,
} from "../src/lib/festividades.js";

test("cada carta se desbloquea exactamente a las 00:00 de Bolivia", () => {
  for (const carta of cartas) {
    const midnight = +new Date(`${carta.fecha}T00:00:00-04:00`);
    assert.equal(
      cartaDisponible(carta, new Date(midnight - 1)),
      false,
      carta.tema,
    );
    assert.equal(cartaDisponible(carta, new Date(midnight)), true, carta.tema);
    assert.equal(
      cartaDisponible(carta, new Date(midnight + 1)),
      true,
      carta.tema,
    );
  }
});
test("la coleccion acumula septiembre, cumpleanos, Halloween y Navidad", () => {
  const cases = [
    ["2026-09-21", 1],
    ["2026-10-14", 2],
    ["2026-10-31", 3],
    ["2026-12-25", 4],
    ["2027-01-01", 4],
    ["2030-07-01", 4],
  ];
  for (const [day, count] of cases)
    assert.equal(
      cartasDisponibles(cartas, `${day}T00:00:00-04:00`).length,
      count,
    );
  assert.equal(cartasDisponibles(cartas, "2026-09-21T03:59:59Z").length, 0);
  assert.deepEqual(
    cartasDisponibles(cartas, "2026-10-14T04:00:00Z").map((c) => c.tema),
    ["cumpleanos", "girasoles"],
  );
});
test("no depende del pais ni del horario de verano del visitante", () => {
  const original = process.env.TZ;
  try {
    for (const tz of [
      "America/La_Paz",
      "Asia/Tokyo",
      "America/New_York",
      "Europe/Madrid",
    ]) {
      process.env.TZ = tz;
      assert.equal(
        cartasDisponibles(cartas, "2026-10-14T03:59:59.999Z").length,
        1,
      );
      assert.equal(cartasDisponibles(cartas, "2026-10-14T04:00:00Z").length, 2);
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
test("calcula la proxima medianoche para actualizar una pagina ya abierta", () => {
  assert.equal(hastaMedianocheBolivia("2026-10-14T03:59:59.999Z"), 1);
  assert.equal(hastaMedianocheBolivia("2026-10-14T04:00:00Z"), 86400000);
  assert.equal(hastaMedianocheBolivia("2026-12-31T23:00:00-04:00"), 3600000);
});
test("fechas invalidas nunca se publican y el editor valida el contenido", () => {
  for (const fecha of ["", "2026-02-30", "2026-13-01", "no-fecha"]) {
    assert.equal(cartaDisponible({ ...cartas[0], fecha }), false);
    assert.throws(() => prepararCartaEspecial({ ...cartas[0], fecha }));
  }
  assert.throws(() => prepararCartaEspecial({ ...cartas[0], titulo: "  " }));
  assert.throws(() =>
    prepararCartaEspecial({ ...cartas[0], tema: "no-existe" }),
  );
  const saved = prepararCartaEspecial({ ...cartas[0], autor: "  Lu  " });
  assert.equal(saved.autor, "Lu");
  assert.equal("id" in saved, false);
  assert.equal("clave" in saved, false);
});
