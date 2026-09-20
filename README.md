# te amo lu ♡

El álbum de **Toto y Lu**, para celebrar su **tercer mes**. El contador empieza el **20 de junio de 2026 a las 00:00, hora de Bolivia**. Todos los aniversarios se cumplen a medianoche del día 20, incluso si abres la web desde otro país.

## Usar ahora

```powershell
npm.cmd install
npm.cmd run dev
```

Abre la dirección de la terminal. Ya puedes crear cartas, recuerdos y subir varias fotos: **no hay login**.

- **+ Momento:** título, descripción, fecha y una foto para la historia.
- **Subir nuestras fotos / + Fotos:** selecciona o arrastra varias imágenes. Puedes ponerles nombres y una fecha. Aparecen en el álbum sin crear entradas en la historia.
- **Escribir una cartita / + Cartita:** escribe el texto y firma como Toto o Lu. Las cartas nuevas aparecen como sobres que se pueden abrir.
- Los iconos de lápiz y papelera permiten editar o eliminar.
- Ajustes permite cambiar nombres, frase y fecha. El inicio se guarda siempre a las 00:00 de Bolivia.
- La playlist fue retirada.

## Dónde se guarda

**Sin variables de Supabase, en desarrollo:** IndexedDB guarda el contenido y las fotos comprimidas en este navegador. Sobreviven a una recarga, pero no se comparten con otro dispositivo. Borrar los datos del navegador también borra este borrador. Hay una nota visible que explica este modo. Las imágenes iniciales son ejemplos y pueden reemplazarse o eliminarse.

**Con Supabase:** se guardan en las tablas `config`, `momentos`, `cartas`, `fotos` y en el bucket `momentos`. Cada navegador ve los datos compartidos al recargar. No se migra automáticamente el borrador local: conecta Supabase antes de cargar el álbum definitivo, o vuelve a seleccionar las fotos y copiar las cartas que quieras compartir.

La carga de varias fotos muestra el avance, comprime cada imagen a WebP (objetivo 0,35 MB, máximo 1600 px) y permite reintentar solo las que fallaron. El límite por archivo de entrada es 25 MB; el total está sujeto al almacenamiento disponible. La fase de subida no mide bytes de red en tiempo real.

En producción, si faltan las variables, aparece una pantalla de configuración. Esto evita confundir un álbum compartido con uno guardado únicamente en un navegador.

## Supabase existente

Ejecuta **[supabase/03-tercer-mes-sin-login.sql](./supabase/03-tercer-mes-sin-login.sql)** en SQL Editor. Añade `fotos`, configura Toto/Lu y el 20 de junio, y habilita edición sin cuenta. No borra los recuerdos ni las tablas anteriores. Ejecutarlo otra vez vuelve a aplicar esos nombres, fecha y frase.

En este modo temporal, **cualquiera con el enlace puede crear, editar y eliminar**. RLS permanece habilitado, con políticas abiertas limitadas a las tablas de esta app y al bucket `momentos`. No se usan claves secretas ni se cambian otros buckets. La autenticación se incorporará después.

Para un proyecto nuevo, sigue **[GUIA-DEPLOY.md](./GUIA-DEPLOY.md)**. Explica paso a paso Supabase, GitHub y Vercel, sin creación de usuarios.

## Variables

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

Guárdalas en `.env.local` para desarrollo y en Vercel para producción. No subas `.env.local` a Git. Nunca uses `secret` o `service_role` en el frontend.

## Comandos

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

React 18, Vite, CSS propio, Framer Motion y Supabase. Node.js 22.12 o posterior.

Las pruebas cubren el cambio exacto de mes en Bolivia, las fechas en distintas zonas horarias y la persistencia local de cartas, varias fotos y configuración. Las pruebas de IndexedDB usan `fake-indexeddb` únicamente como dependencia de desarrollo. Para validar una conexión real con Supabase debes ejecutar los SQL y comprobar la carga/edición en tu proyecto.

## Archivos principales

- `src/componentes/`: secciones, editor, subida múltiple y modales.
- `src/lib/fechas.js`: calendario, fecha y hora de Bolivia.
- `src/lib/contenido.js`: lectura y escritura de Supabase o del borrador local.
- `src/lib/localStore.js`: IndexedDB.
- `src/lib/imagenes.js`: compresión y almacenamiento de fotos.
- `src/lib/demo.js`: datos iniciales del borrador local.
- `supabase/03-tercer-mes-sin-login.sql`: migración para esta versión.

Modales con Escape, foco contenido y retorno de foco; campos etiquetados; galería con flechas y deslizamiento; movimiento reducido sin confetti ni corazones flotantes. Google Fonts sirve las tipografías. `noindex` solicita no indexar la web, pero no limita el acceso.

## Créditos de las fotos de ejemplo

- [Arina Krasnikova / Pexels](https://www.pexels.com/photo/close-up-photo-of-couple-holding-hands-7351069/), [licencia](https://www.pexels.com/license/).
- [Joshua Woroniecki / Unsplash](https://unsplash.com/photos/sea-waves-crashing-on-shore-during-sunset-vuryN0kFmNM), [licencia](https://unsplash.com/license).
- [Annie Spratt / Unsplash](https://unsplash.com/photos/pink-roses-6Fy2wQaR03k), [licencia](https://unsplash.com/license).
