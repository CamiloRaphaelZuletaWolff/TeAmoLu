import test from "node:test";
import assert from "node:assert/strict";
import { tiempoJuntos, musicUrl, spotifyEmbed } from "../src/lib/fechas.js";

test("cuenta meses de calendario y segundos restantes", () => {
  assert.deepEqual(
    tiempoJuntos("2026-08-19T20:00:00Z", "2026-09-19T21:02:03Z"),
    { meses: 1, días: 0, horas: 1, minutos: 2, segundos: 3 },
  );
});
test("ajusta el aniversario de fin de mes y el año bisiesto", () => {
  assert.equal(
    tiempoJuntos("2024-01-31T12:00:00Z", "2024-02-29T12:00:00Z").meses,
    1,
  );
  assert.equal(
    tiempoJuntos("2025-01-31T12:00:00Z", "2025-02-28T11:59:59Z").meses,
    0,
  );
  assert.equal(
    tiempoJuntos("2025-12-31T12:00:00Z", "2026-01-31T12:00:00Z").meses,
    1,
  );
});
test("una fecha futura o inválida nunca produce números negativos o NaN", () => {
  for (const start of ["invalid", "2099-01-01"])
    assert.deepEqual(tiempoJuntos(start, "2026-01-01"), {
      meses: 0,
      días: 0,
      horas: 0,
      minutos: 0,
      segundos: 0,
    });
});
test("solo admite enlaces seguros de los proveedores de música", () => {
  for (const value of [
    "javascript:alert(1)",
    "https://open.spotify.com.attacker.test/track/abc",
    "http://youtube.com",
    "https://example.org",
  ])
    assert.equal(musicUrl(value), null);
  assert.equal(musicUrl("https://youtu.be/abc"), "https://youtu.be/abc");
});
test("normaliza Spotify internacional sin incorporar parámetros externos", () => {
  assert.equal(
    spotifyEmbed("https://open.spotify.com/intl-es/track/abc123?si=123"),
    "https://open.spotify.com/embed/track/abc123",
  );
  assert.equal(
    spotifyEmbed("https://open.spotify.com/playlist/abc123"),
    "https://open.spotify.com/embed/playlist/abc123",
  );
  assert.equal(spotifyEmbed("https://attacker.test/track/abc123"), null);
});
