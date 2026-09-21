import { fechaHoraBolivia } from "./fechas.js";

export const TEMAS_FESTIVOS = {
  girasoles: {
    nombre: "Girasoles y flores amarillas",
    simbolo: "🌻",
    particulas: ["🌻", "🌻", "🌻", "💛"],
    etiqueta: "Un poquito de sol para ti",
    accion: "Que lluevan girasoles",
  },
  cumpleanos: {
    nombre: "Cumpleaños de Lu",
    simbolo: "🎂",
    particulas: ["🎈", "✨", "🎊", "💖"],
    etiqueta: "Hoy el universo te celebra",
    accion: "Volver a celebrar",
  },
  halloween: {
    nombre: "Halloween",
    simbolo: "🎃",
    particulas: ["🎃", "👻", "🦇", "✨"],
    etiqueta: "Un amor de otro mundo",
    accion: "Un poquito más de magia",
  },
  navidad: {
    nombre: "Navidad",
    simbolo: "🎄",
    particulas: ["❄️", "⭐", "🎄", "🎁"],
    etiqueta: "Mi regalo favorito eres tú",
    accion: "Que vuelva a nevar",
  },
  amor: {
    nombre: "Un día especial",
    simbolo: "💌",
    particulas: ["💗", "🌸", "✨", "💌"],
    etiqueta: "Un día más para elegirte",
    accion: "Más amor para ti",
  },
};

// Plantillas del borrador local; en producción las cartas se leen solo desde Supabase.
export const CARTAS_FESTIVAS_INICIALES = [
  {
    id: "20260921-0000-4000-8000-000000000001",
    clave: "girasoles-2026",
    fecha: "2026-09-21",
    tema: "girasoles",
    titulo: "Todos los girasoles para ti",
    subtitulo: "21 de septiembre · Flores amarillas para mi amorcito",
    autor: "Toto",
    contenido:
      "Lu,\n\nHoy, 21 de septiembre, quería regalarte un pedacito de sol. Así que llené este lugar de girasoles, uno por cada sonrisa que me regalas.\n\nDicen que los girasoles buscan la luz. Yo, sin darme cuenta, siempre te busco a ti.\n\nQue nunca te falten flores amarillas, días bonitos y este amor que tengo tantas ganas de seguir cuidando contigo.\n\nFeliz 21 de septiembre, mi amor. Tú haces florecer mis días.",
  },
  {
    id: "20261014-0000-4000-8000-000000000002",
    clave: "cumpleanos-lu-2026",
    fecha: "2026-10-14",
    tema: "cumpleanos",
    titulo: "El día que nació mi persona favorita",
    subtitulo: "14 de octubre · Feliz cumpleaños, Lu",
    autor: "Toto",
    contenido:
      "Mi Lu,\n\nHoy celebro que existes. Tu risa, tus ocurrencias, tu forma tan tuya de hacer más bonito el mundo.\n\nOjalá este nuevo año te traiga sueños cumplidos, abrazos largos y muchísimas razones para sonreír. Yo quiero estar cerquita para celebrar cada una contigo.\n\nPide un deseo. El mío es seguir compartiendo la vida contigo.\n\nFeliz cumpleaños, mi amor.",
  },
  {
    id: "20261031-0000-4000-8000-000000000003",
    clave: "halloween-2026",
    fecha: "2026-10-31",
    tema: "halloween",
    titulo: "Contigo, hasta los sustos son bonitos",
    subtitulo: "31 de octubre · Nuestro pequeño hechizo",
    autor: "Toto",
    contenido:
      "Lu,\n\nEntre fantasmitas, calabazas y noches de películas, hay algo que tengo clarísimo: mi hechizo favorito fue coincidir contigo.\n\nSi hay sustos, te doy la mano. Si hay dulces, compartimos. Y si hay que elegir compañía para una noche de Halloween, siempre te elijo a ti.\n\nTe quiero de aquí a la luna, con un poquito de magia y muchísimos abrazos.",
  },
  {
    id: "20261225-0000-4000-8000-000000000004",
    clave: "navidad-2026",
    fecha: "2026-12-25",
    tema: "navidad",
    titulo: "Mi regalo favorito eres tú",
    subtitulo: "25 de diciembre · Una Navidad contigo",
    autor: "Toto",
    contenido:
      "Mi amor,\n\nEsta Navidad no necesito un regalo enorme. Me basta con tus abrazos, nuestras risas y la ilusión de todo lo que todavía nos espera.\n\nGracias por hacer que un lugar cualquiera se sienta como casa cuando estás tú.\n\nQue nunca nos falten motivos para celebrar, ganas de cuidarnos y un ratito para estar juntos.\n\nFeliz Navidad, Lu. Mi regalo favorito es tenerte en mi vida.",
  },
];

export function esFechaValida(fecha) {
  return (
    typeof fecha === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    Number.isFinite(Date.parse(`${fecha}T00:00:00Z`)) &&
    new Date(`${fecha}T00:00:00Z`).toISOString().slice(0, 10) === fecha
  );
}
export function cartaDisponible(carta, ahora = new Date()) {
  return (
    esFechaValida(carta.fecha) &&
    Number.isFinite(+new Date(ahora)) &&
    carta.fecha <= fechaHoraBolivia(ahora).slice(0, 10)
  );
}
export function cartasDisponibles(cartas, ahora = new Date()) {
  return cartas
    .filter((carta) => cartaDisponible(carta, ahora))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || a.id.localeCompare(b.id));
}
export function hastaMedianocheBolivia(ahora = new Date()) {
  const fecha = fechaHoraBolivia(ahora).slice(0, 10);
  return +new Date(`${fecha}T00:00:00-04:00`) + 86400000 - +new Date(ahora);
}
export function prepararCartaEspecial(values) {
  const payload = Object.fromEntries(
    ["titulo", "subtitulo", "autor", "contenido", "fecha", "tema"].map(
      (key) => [key, String(values[key] || "").trim()],
    ),
  );
  for (const [key, max] of [
    ["titulo", 140],
    ["subtitulo", 200],
    ["autor", 100],
    ["contenido", 20000],
  ]) {
    if ((key !== "subtitulo" && !payload[key]) || payload[key].length > max)
      throw new Error(
        "Completa título, carta y firma sin exceder los límites indicados.",
      );
  }
  if (!esFechaValida(payload.fecha)) throw new Error("Elige una fecha válida.");
  if (!Object.hasOwn(TEMAS_FESTIVOS, payload.tema))
    throw new Error("Elige una de las temáticas disponibles.");
  return payload;
}
