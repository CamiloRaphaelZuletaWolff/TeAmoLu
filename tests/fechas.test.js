import test from "node:test";
import assert from "node:assert/strict";
import {
  tiempoJuntos,
  fechaHoraBolivia,
  desdeHoraBolivia,
  fechaBonita,
} from "../src/lib/fechas.js";
const start = "2026-06-20T00:00:00-04:00";
test("cumple tres meses exactamente el 20 a las 00:00 de Bolivia", () => {
  assert.deepEqual(tiempoJuntos(start, "2026-09-20T04:00:00Z"), {
    meses: 3,
    días: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });
  assert.deepEqual(tiempoJuntos(start, "2026-09-20T03:59:59Z"), {
    meses: 2,
    días: 30,
    horas: 23,
    minutos: 59,
    segundos: 59,
  });
});
test("conserva el 20 al mostrar fechas y convertir el formulario", () => {
  assert.equal(fechaHoraBolivia(start), "2026-06-20T00:00");
  assert.equal(
    desdeHoraBolivia("2026-06-20T00:00"),
    "2026-06-20T04:00:00.000Z",
  );
  assert.match(fechaBonita(start), /20 de junio de 2026/);
  assert.match(fechaBonita("2026-06-20"), /20 de junio de 2026/);
  assert.equal(fechaHoraBolivia("2026-09-20T02:00:00Z"), "2026-09-19T22:00");
});
test("cuenta igual desde Bolivia, Japón o una zona con cambio de hora", () => {
  const original = process.env.TZ;
  try {
    for (const timezone of [
      "America/La_Paz",
      "Asia/Tokyo",
      "America/New_York",
      "Europe/Madrid",
    ]) {
      process.env.TZ = timezone;
      assert.equal(fechaHoraBolivia(start), "2026-06-20T00:00");
      assert.deepEqual(tiempoJuntos(start, "2026-09-20T05:02:03Z"), {
        meses: 3,
        días: 0,
        horas: 1,
        minutos: 2,
        segundos: 3,
      });
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
test("ajusta fin de mes y años bisiestos en el calendario boliviano", () => {
  assert.equal(
    tiempoJuntos("2024-01-31T00:00:00-04:00", "2024-02-29T00:00:00-04:00")
      .meses,
    1,
  );
  assert.equal(
    tiempoJuntos("2025-01-31T00:00:00-04:00", "2025-02-27T23:59:59-04:00")
      .meses,
    0,
  );
  assert.equal(
    tiempoJuntos("2025-12-20T00:00:00-04:00", "2026-01-20T00:00:00-04:00")
      .meses,
    1,
  );
});
test("fechas futuras o inválidas no producen negativos", () => {
  for (const date of ["invalid", "2099-01-01"])
    assert.deepEqual(tiempoJuntos(date, "2026-01-01"), {
      meses: 0,
      días: 0,
      horas: 0,
      minutos: 0,
      segundos: 0,
    });
});
