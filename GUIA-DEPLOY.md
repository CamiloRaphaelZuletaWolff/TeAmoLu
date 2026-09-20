# Publicar «te amo lu», paso a paso ♡

Versión para Toto y Lu, tercer mes, **sin login**. Inicio: **20 de junio de 2026, 00:00 de Bolivia (UTC−4)**.

Esta guía va en orden. No te saltes pasos: el orden importa en Supabase (los scripts SQL dependen unos de otros) y en Vercel (las variables tienen que existir **antes** de compilar).

---

## 0. Estado actual del proyecto

Verificado antes de escribir esta guía:

| Comprobación | Resultado |
|---|---|
| `npm test` | 9 de 9 pasan |
| `npm run build` | compila sin errores |
| Login | eliminado por completo (no queda `useSesion`, `Playlist` ni llamadas a `auth`) |
| Repositorio | `https://github.com/CamiloRaphaelZuletaWolff/TeAmoLu.git`, rama `main`, ya enlazada |
| `.env.local` | todavía no existe; lo creas en el paso 5 |
| Cambios sin subir | sí, todo el trabajo «sin login» está pendiente de commit |

Lo único que falta para tener la web en línea es: Supabase (pasos 2–4), probarlo local (paso 5), subir a GitHub (paso 6) y desplegar en Vercel (paso 7).

### Qué significa «sin login» aquí

No hay pantalla de acceso y **cualquiera que tenga el enlace puede añadir, editar y borrar** fotos, cartas y momentos. Es lo que pediste y para una página privada entre ustedes dos está bien, pero conviene saberlo:

- La página lleva `noindex,nofollow`, así que no aparece en Google.
- La protección real es que nadie más conozca la URL. No la publiques en redes.
- Se puede volver a poner login después: el script 03 deja RLS activado justamente para eso, y explica al final cómo revertirlo.

---

## 1. Verla en tu computadora (modo borrador)

1. Necesitas [Node.js LTS](https://nodejs.org/) 22.12 o superior y [Git](https://git-scm.com/downloads/win).
2. Abre PowerShell y ejecuta:

```powershell
cd "C:\Users\caezu\Desktop\teAmoLu"
npm.cmd install
npm.cmd run dev
```

3. Abre la URL de la terminal, normalmente `http://127.0.0.1:5173`.
4. Ya puedes añadir fotos, cartas y momentos. **Ojo:** sin Supabase todo se guarda solo en ese navegador (aparece el aviso «Guardado en este navegador»).
5. Para detener el servidor: **Ctrl + C**.

Ese borrador local **no se migra solo** a Supabase. Conecta primero la base de datos y después carga el álbum definitivo.

---

## 2. Crear el proyecto en Supabase

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) y crea la cuenta.
2. Crea una organización personal si te la pide.
3. **New project**.
4. Nombre: `te-amo-lu`.
5. Genera la contraseña de base de datos y guárdala en un lugar seguro. **Esta contraseña nunca va en la web.**
6. Región: la más cercana, por ejemplo São Paulo.
7. Plan Free.
8. **Create project** y espera uno o dos minutos a que termine de prepararse.

---

## 3. Crear las tablas y el almacén de fotos

Son tres scripts y hay que correrlos **en este orden**.

### 3.1 · Script 01 — tablas base

1. Abre `supabase/01-esquema.sql` en tu computadora y copia todo el contenido.
2. En Supabase: **SQL Editor → New query**.
3. Pega y pulsa **Run**.
4. En **Table Editor** deben aparecer `config`, `momentos`, `cartas` y `canciones`.

`canciones` es de la playlist vieja. Queda sin usar y no molesta; puedes ignorarla.

### 3.2 · El bucket de fotos

1. **Storage → New bucket**.
2. Nombre exacto, en minúsculas: **`momentos`**.
3. Activa **Public bucket**. Es obligatorio: si no, las fotos no se ven.
4. Si te ofrece límites, pon **5 MB** y tipo MIME `image/*`. Es de sobra: la app comprime cada foto a WebP de ~350 KB antes de subirla.
5. **Create bucket**.

### 3.3 · Script 02 — permisos del bucket

1. Copia todo `supabase/02-storage.sql`.
2. **SQL Editor → New query**, pega y **Run**.

### 3.4 · Script 03 — habilitar la edición sin cuenta

**Este es el paso que hace que funcione sin login.** Sin él, la web carga pero no deja guardar nada.

1. Copia todo `supabase/03-tercer-mes-sin-login.sql`.
2. **SQL Editor → New query**, pega y **Run**.
3. Comprueba en **Table Editor** que ahora existe la tabla **`fotos`**.
4. Abre `config`: debe decir **Toto**, **Lu** y la fecha de inicio correcta.

> Si el panel muestra `2026-06-20 04:00:00+00`, está bien: Supabase enseña la hora en UTC y eso son las 00:00 de Bolivia.

Qué hace el script 03, en concreto:

- Crea la tabla `fotos` (galería separada de la historia).
- Da permiso de lectura **y escritura** al rol anónimo sobre `config`, `momentos`, `cartas` y `fotos`.
- Da permiso de subida y borrado en el bucket `momentos`.
- Deja escritos los nombres, la fecha y la frase de esta versión.

No borra recuerdos. Puedes volver a ejecutarlo cuando quieras; lo único que hace es reaplicar nombres, fecha y frase.

---

## 4. Copiar la URL y la clave

1. **Project Settings → Data API** → copia **Project URL**. Tiene que terminar en `.supabase.co` y **nada más**:

   ```
   https://abcdefghijklmnop.supabase.co        ← correcto
   https://abcdefghijklmnop.supabase.co/rest/v1/   ← NO, ese es el endpoint REST
   ```

   El panel muestra ambos y se confunden con facilidad. El SDK añade `/rest/v1/` por su cuenta; si lo incluyes, pide `/rest/v1//rest/v1/config` y todo falla con `PGRST125`.
2. **Project Settings → API Keys** → copia la **Publishable key**, que empieza por `sb_publishable_`.
   - Si tu panel todavía muestra el formato antiguo, la equivalente es la **anon / public key**. Cualquiera de las dos sirve.
3. **No uses** la Secret key, la service_role ni la contraseña de la base de datos. Esas dan control total y quedarían visibles en el navegador.

---

## 5. Conectar la app local y probarla de verdad

1. Detén Vite con **Ctrl + C**.
2. Crea el archivo de variables:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

3. Rellena las dos líneas, sin comillas y sin espacios alrededor del `=`:

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

4. Guárdalo como `.env.local` exacto (Notepad puede añadir `.txt`: en el diálogo elige «Todos los archivos»).
5. Vuelve a arrancar: `npm.cmd run dev`. **Vite solo lee las variables al arrancar**, por eso hay que reiniciarlo.
6. Recarga la página. Debe desaparecer el aviso «Guardado en este navegador». Las secciones pueden verse vacías: el borrador local es otra cosa y se queda aparte.

Ahora prueba las cuatro cosas, en este orden:

- **+ Fotos** → elige varias imágenes, ponles nombre y una fecha común → Guardar. Aparecen en la galería sin crear entradas en la historia.
- **+ Cartita** → escribe, firma, guarda. Aparece un sobre nuevo.
- **+ Momento** → añade un evento a la historia.
- Borra una foto de prueba y confirma en **Storage → momentos** que su archivo también desapareció.

Recarga la página. Si todo sigue ahí, Supabase está bien conectado.

Si alguna foto falla, el cuadro conserva solo las pendientes para reintentarlas sin duplicar las que ya se guardaron.

---

## 6. Subir el código a GitHub

Tu repositorio ya existe y `main` ya está enlazada, así que **no** hace falta `git init` ni `git remote add`. Solo confirmar y subir.

1. Comprueba que el archivo de claves está protegido:

```powershell
cd "C:\Users\caezu\Desktop\teAmoLu"
git check-ignore .env.local
```

Tiene que responder `.env.local`. Si no responde nada, **detente**: subirías tus claves.

2. Comprueba el proyecto y mira qué vas a subir:

```powershell
npm.cmd test
npm.cmd run build
git add .
git status
```

3. En la lista **no** deben aparecer `.env.local`, `node_modules/` ni `dist/`. Sí debe aparecer `.env.example` (está vacío a propósito, es la plantilla).
4. Sube:

```powershell
git commit -m "te amo lu: nuestro tercer mes, sin login"
git push
```

5. Si se abre el navegador, inicia sesión en GitHub. Si el push falla por autenticación, instala [GitHub CLI](https://cli.github.com/), ejecuta `gh auth login`, elige acceso por navegador y repite el `git push`.

---

## 7. Publicar en Vercel

1. Entra a [vercel.com](https://vercel.com/) y accede **con GitHub**.
2. Plan Hobby (gratuito) es suficiente.
3. **Add New → Project**.
4. Busca **TeAmoLu** y pulsa **Import**. Si no aparece, usa **Adjust GitHub App Permissions** y dale acceso a ese repositorio.
5. Configura así:

| Campo | Valor |
|---|---|
| Framework Preset | **Vite** |
| Root Directory | la raíz, sin subcarpeta |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | automático (o `npm ci`) |
| Node.js Version | 22.x |

6. **Antes de pulsar Deploy**, abre **Environment Variables** y añade las dos, con los mismos valores del `.env.local`:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://TU-PROYECTO.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_TU_CLAVE` |

7. Márcalas para **Production** y también **Preview** si vas a usar despliegues de prueba.

> **Esto es lo más importante de todo el despliegue.** Vite incrusta las variables *durante la compilación*, no las lee al abrir la página. Si compilas sin ellas, el sitio queda publicado sin Supabase y muestra la pantalla «Casi listo para nuestra historia». Añadirlas después no arregla nada por sí solo: hay que **volver a desplegar**.

8. Pulsa **Deploy** y espera el estado **Ready**.
9. Pulsa **Visit**. Esa URL `https://...vercel.app` es la que le compartes a Lu.

No hace falta `vercel.json`: la página es una sola vista y navega con anclas.

Si cambias una variable más adelante: **Deployments → … → Redeploy**.

---

## 8. Comprobar antes de compartir

Abre la URL de producción, a ser posible desde el teléfono y no desde la computadora donde probaste.

- [ ] El título dice **te amo lu** y aparecen Toto y Lu.
- [ ] **No** sale la pantalla «Casi listo para nuestra historia». Si sale, faltan las variables en Vercel (paso 7.6) o falta el redeploy.
- [ ] El contador arranca el **20/06/2026 a las 00:00 de Bolivia**.
- [ ] Las fotos que subiste desde tu computadora se ven también aquí.
- [ ] Puedes escribir una carta desde el teléfono, sin cuenta, y sigue ahí al recargar.
- [ ] Puedes ampliar una foto y editar su nombre.
- [ ] No aparece ninguna playlist ni ningún formulario de login.
- [ ] Estás compartiendo la URL de **Production**. Una de Preview puede pedir acceso de Vercel.
- [ ] En GitHub, el repo **no** contiene `.env.local`.

Si la URL de producción te pide iniciar sesión en Vercel, eso no es un login de la app: revisa **Settings → Deployment Protection** y baja la protección para producción.

---

## 9. Actualizar después

Fotos, cartas, nombres y fecha se cambian **desde la propia página**. No hay que desplegar otra vez; quien abra el enlace verá los cambios al recargar.

Solo si tocas código:

```powershell
npm.cmd test
npm.cmd run build
git add .
git commit -m "Más amor para Lu"
git push
```

Vercel despliega solo al detectar el push.

---

## 10. Resolver problemas

| Problema | Qué revisar |
|---|---|
| Sale «Casi listo para nuestra historia» | Faltan `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en Vercel, o las añadiste sin volver a desplegar. |
| En el build local aparece `Generated an empty chunk: "supabase"` | Normal si compilas sin `.env.local`. Vite descarta el SDK porque la conexión no existe. Con las variables puestas, ese chunk pesa unos 227 kB. |
| «Nuestros recuerdos vuelven enseguida» y el detalle dice `PGRST125` o `Invalid path specified in request URL` | La `VITE_SUPABASE_URL` lleva `/rest/v1/` pegado al final. Déjala terminando en `.supabase.co` (paso 4) y reinicia Vite, o vuelve a desplegar en Vercel. |
| «Nuestros recuerdos vuelven enseguida» con otro detalle | El mensaje entre paréntesis dice qué tabla falló y por qué. Si nombra `fotos`, falta el script 03; si habla de JWT o API key, la clave está mal copiada. |
| No deja guardar nada | Falta ejecutar `03-tercer-mes-sin-login.sql`. Quitar el login de la pantalla no cambia los permisos del servidor. |
| «Falta la tabla fotos» o no carga el álbum | El script 03 no se ejecutó, o se ejecutó antes que el 01. Córrelos en orden. |
| Mis fotos no se ven en otro dispositivo | Estabas en modo borrador local, o conectaste otro proyecto de Supabase. El borrador local no sincroniza ni se migra solo. |
| La foto no sube | Bucket llamado exactamente `momentos`, script 03 ejecutado, y archivo compatible. Prueba JPG o PNG si el navegador no admite HEIC. |
| Las fotos suben pero no se ven | El bucket no está marcado como **Public**. |
| En Supabase la fecha dice 20 de junio a las 04:00 | El panel muestra UTC. Equivale a las 00:00 de Bolivia. Está correcto. |
| «No hay espacio local» | Es el modo borrador llenando la cuota del navegador. Conecta Supabase. |
| La web dejó de responder de un día para otro | Los proyectos Free de Supabase se pausan por inactividad. Entra al panel y pulsa Restore. |
| `npm` bloqueado en PowerShell | Usa `npm.cmd`, como en toda esta guía. |

Referencias: [buckets de Storage](https://supabase.com/docs/guides/storage/buckets/creating-buckets) · [claves de API](https://supabase.com/docs/guides/getting-started/api-keys) · [pausa de proyectos Free](https://supabase.com/docs/guides/platform/free-project-pausing) · [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite) · [variables de entorno en Vercel](https://vercel.com/docs/environment-variables)
