export const ZONA_HORARIA = "America/La_Paz";
const BOLIVIA_OFFSET = -4 * 60 * 60 * 1000;
// UTC-4, independiente de la zona horaria del dispositivo.
const boliviaClock = (value) => new Date(+new Date(value) + BOLIVIA_OFFSET);
export function fechaHoraBolivia(value = new Date()) {
  return boliviaClock(value).toISOString().slice(0, 16);
}
export function desdeHoraBolivia(value) {
  return new Date(`${value}:00-04:00`).toISOString();
}
export const hoyBolivia = () => fechaHoraBolivia().slice(0, 10);
export function tiempoJuntos(startValue, nowValue = new Date()) {
  const start = boliviaClock(startValue),
    now = boliviaClock(nowValue);
  if (!Number.isFinite(+start) || !Number.isFinite(+now) || now < start)
    return { meses: 0, días: 0, horas: 0, minutos: 0, segundos: 0 };
  const anniversary = (months) => {
    const date = new Date(start);
    date.setUTCDate(1);
    date.setUTCMonth(start.getUTCMonth() + months);
    const last = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
    ).getUTCDate();
    date.setUTCDate(Math.min(start.getUTCDate(), last));
    return date;
  };
  let meses =
    (now.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    now.getUTCMonth() -
    start.getUTCMonth();
  if (anniversary(meses) > now) meses--;
  let seconds = Math.floor((now - anniversary(meses)) / 1000);
  const días = Math.floor(seconds / 86400);
  seconds %= 86400;
  const horas = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutos = Math.floor(seconds / 60);
  return { meses, días, horas, minutos, segundos: seconds % 60 };
}
export const fechaBonita = (value) =>
  new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA_HORARIA,
  }).format(new Date(value.length === 10 ? `${value}T12:00:00-04:00` : value));
export const fechaConHora = (value) =>
  new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA_HORARIA,
  }).format(new Date(value));
