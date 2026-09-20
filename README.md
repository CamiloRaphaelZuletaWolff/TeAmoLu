# Nuestro rinconcito ♡

Un álbum de aniversario con React 18, Vite, CSS propio, Framer Motion y Supabase. Incluye contador de meses de calendario, historia, galería con lightbox, cartas animadas, música y edición con contraseña.

## Empezar

En PowerShell, dentro de esta carpeta:

```powershell
npm install
npm run dev
```

Abre la dirección que muestra la terminal. Sin credenciales, **solo en desarrollo**, aparece una muestra identificada con fotos y textos de ejemplo. No guarda datos ni permite editar. En producción, si faltan las variables, se muestra una pantalla de configuración; nunca se publica la demo por accidente.

**Para conectar y publicar, sigue [GUIA-DEPLOY.md](./GUIA-DEPLOY.md).** Está escrita desde cero para Windows e incluye GitHub, Supabase y Vercel.

## Variables

```powershell
Copy-Item .env.example .env.local
```

Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. Reinicia el servidor después. No uses claves secretas. `.env.local` se excluye de Git.

## Uso

- Visitar: cualquiera con el enlace puede leer el contenido y ver las fotos.
- Editar: pulsa tres veces seguidas el corazón del pie e inicia sesión con una cuenta creada en Supabase.
- La barra de edición permite añadir momentos, cartas y canciones. El icono de ajustes cambia nombres, fecha y frase.
- Las fotos se comprimen a WebP (objetivo 0,35 MB, lado máximo 1600 px). El indicador muestra compresión, subida y guardado; la fase de subida no representa bytes transmitidos en tiempo real.
- Los botones de editar/eliminar solo se montan con sesión. La autorización real depende de RLS, de cerrar el registro y de desactivar los inicios anónimos.
- Los reproductores de Spotify se cargan al pulsar el botón de reproducción de cada canción. Los enlaces se abren en otra pestaña. No hay reproducción automática.
- Al borrar un recuerdo se elimina su foto. Si Storage falla después de guardar/eliminar, el aviso indica el archivo que debes limpiar en el panel. Base de datos y Storage no forman una única transacción.

## Comandos

```powershell
npm run dev       # desarrollo
npm test          # calendario y validación de enlaces
npm run build    # producción en dist/
npm run preview  # comprobar el build local
```

Node.js 22.12 o posterior. `package-lock.json` fija las versiones resueltas. Para instalar exactamente esas versiones: `npm ci`.

## Organización

```text
src/
  componentes/   # secciones, modales y formularios
  estilos/       # paleta, responsive y animaciones
  hooks/         # lectura de datos y sesión
  lib/           # Supabase, fechas, imágenes, confetti y demo
supabase/
  01-esquema.sql # tablas, índices, RLS y configuración inicial
  02-storage.sql# políticas del bucket momentos
tests/          # pruebas del contador y URLs
```

La estructura de las cuatro tablas mantiene la especificación proporcionada. Los scripts SQL pueden repetirse: recrean únicamente sus propias políticas y conservan los registros. No crees cuentas desde el frontend ni agregues una clave `service_role`.

## Detalles de accesibilidad y privacidad

Modales nativos con Escape, foco contenido y retorno de foco; botones etiquetados, navegación por teclado y formularios con etiquetas. Las preferencias de movimiento reducido desactivan los corazones flotantes y el confetti. La galería admite flechas y deslizamiento. El contador no interrumpe al lector de pantalla cada segundo.

El diseño es íntimo, **pero los datos son públicos según la especificación**. `noindex` solicita que los buscadores no indexen la página; no sustituye acceso privado. Google Fonts carga tipografías externas y Spotify se conecta cuando se abre un reproductor. Si se desea lectura privada, habría que cambiar RLS, el bucket y el flujo de acceso.

## Fotos de ejemplo

Solo se usan como datos de muestra en desarrollo. Las fotos reales se cargan desde Supabase al conectarlo.

- Manos: [Arina Krasnikova / Pexels](https://www.pexels.com/photo/close-up-photo-of-couple-holding-hands-7351069/), [licencia](https://www.pexels.com/license/).
- Atardecer: [Joshua Woroniecki / Unsplash](https://unsplash.com/photos/sea-waves-crashing-on-shore-during-sunset-vuryN0kFmNM), [licencia](https://unsplash.com/license).
- Rosa: [Annie Spratt / Unsplash](https://unsplash.com/photos/pink-roses-6Fy2wQaR03k), [licencia](https://unsplash.com/license).

## Comprobaciones pendientes con tu proyecto

El build y las pruebas locales no requieren credenciales. La autenticación real, RLS, la persistencia y la subida/borrado en Storage deben verificarse después de configurar tu Supabase, con la lista final de la guía. No se han creado proyectos remotos ni desplegado esta app en tu cuenta.
