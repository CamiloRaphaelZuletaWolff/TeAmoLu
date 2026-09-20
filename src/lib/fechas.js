export function tiempoJuntos(startValue, nowValue = new Date()) {
  const start = new Date(startValue),
    now = new Date(nowValue);
  if (!Number.isFinite(+start) || !Number.isFinite(+now) || now < start)
    return { meses: 0, días: 0, horas: 0, minutos: 0, segundos: 0 };
  const anniversary = (months) => {
    const date = new Date(start);
    date.setDate(1);
    date.setMonth(start.getMonth() + months);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(start.getDate(), last));
    return date;
  };
  let meses =
    (now.getFullYear() - start.getFullYear()) * 12 +
    now.getMonth() -
    start.getMonth();
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
  new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value));
export function spotifyEmbed(value) {
  try {
    const url = new URL(value);
    const match = url.pathname.match(
      /^\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([a-zA-Z0-9]+)\/?$/,
    );
    return url.protocol === "https:" &&
      url.hostname === "open.spotify.com" &&
      match
      ? `https://open.spotify.com/embed/${match[1]}/${match[2]}`
      : null;
  } catch {
    return null;
  }
}
export function musicUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      [
        "open.spotify.com",
        "youtube.com",
        "www.youtube.com",
        "music.youtube.com",
        "youtu.be",
      ].includes(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
