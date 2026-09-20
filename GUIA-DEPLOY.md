# De tu computadora a su corazón ♡

Esta guía publica **esta app** en Vercel y conecta sus recuerdos con Supabase. Haz los pasos en orden. No necesitas programar ni pegar contraseñas en el código.

La carpeta del proyecto es:

```text
C:\Users\caezu\Desktop\teAmoLu
```

**Qué vas a conseguir:** un enlace de Vercel que ella podrá abrir sin entrar a una cuenta. Solo las cuentas que tú crees podrán editar. Las fotos y cartas son de lectura pública, aunque el repositorio de GitHub sea privado.

## 1. Preparar tu computadora

1. Instala una versión LTS de [Node.js](https://nodejs.org/) que sea 22.12 o superior. Si ya lo tienes, no hace falta reinstalarlo.
2. Instala [Git para Windows](https://git-scm.com/downloads/win) si todavía no está instalado.
3. Cierra y vuelve a abrir PowerShell después de instalar.
4. Comprueba:

```powershell
node --version
npm.cmd --version
git --version
```

Cada comando debe mostrar un número de versión. En esta guía usamos `npm.cmd` para evitar bloqueos de ejecución de scripts en PowerShell.

5. Abre el proyecto:

```powershell
cd "C:\Users\caezu\Desktop\teAmoLu"
npm.cmd install
npm.cmd run dev
```

6. Abre la dirección que aparece en la terminal, normalmente `http://127.0.0.1:5173`.
7. Verás una muestra rosada con fotos de ejemplo. Todavía no está conectada: es normal.
8. Mantén esa terminal abierta mientras miras la web. Para detenerla, pulsa **Ctrl + C**. Para volver a verla, ejecuta otra vez `npm.cmd run dev`.

**Checkpoint:** puedes recorrer la historia, ampliar una foto y abrir una carta.

## 2. Crear tu cuenta de GitHub

1. Abre [GitHub](https://github.com/) y pulsa **Sign up**.
2. Completa el registro y verifica tu correo.
3. Guarda tu usuario; lo usarás más adelante.

Si ya tienes cuenta, usa esa.

## 3. Crear Supabase

1. Entra a [Supabase](https://supabase.com/dashboard).
2. Inicia sesión con GitHub o con el método que prefieras.
3. Si te pide una organización, crea una personal.
4. Elige **New project**.
5. Nombre: `nuestro-rinconcito`.
6. Genera una contraseña para la base de datos y guárdala en tu gestor de contraseñas. **No es la contraseña que usarás para entrar a la web.**
7. Elige una región cercana; desde Bolivia, São Paulo suele ser una opción adecuada si está disponible.
8. Selecciona el plan que prefieras; para comenzar puedes usar Free dentro de sus límites vigentes.
9. Pulsa **Create project** y espera a que esté listo.

**Checkpoint:** ves el panel de tu proyecto.

## 4. Cerrar el registro y crear sus cuentas

Haz esto antes de compartir la app. Las políticas del documento permiten editar a cualquier usuario autenticado, así que solo deben existir sus cuentas.

1. Ve a **Authentication → Sign In / Providers**.
2. Busca **Allow new users to sign up** y desactívalo. Guarda.
3. Deja **Allow anonymous sign-ins** desactivado también. Visitar sin login no requiere usuarios anónimos de Auth.
4. Conserva Email habilitado; no necesitas Google, GitHub ni otros proveedores para el acceso a esta web.
5. Entra a **Authentication → Users → Add user → Create new user**.
6. Escribe tu correo y una contraseña para la web.
7. Activa **Auto Confirm User** si aparece y crea el usuario.
8. Repite para ella si también quieres que pueda editar. Puedes crear solo tu cuenta.
9. Verifica que la lista contiene únicamente las cuentas previstas.

El administrador puede crear usuarios desde el panel aunque el registro público esté cerrado. Los nombres de los menús pueden variar ligeramente. [Referencia de configuración de Auth](https://supabase.com/docs/guides/auth/general-configuration).

**Checkpoint:** registro público cerrado, inicios anónimos desactivados y cuentas creadas.

## 5. Crear las cuatro tablas

1. En esta carpeta abre **`supabase/01-esquema.sql`** con VS Code o el Bloc de notas.
2. Baja a la sección **DATOS INICIALES**.
3. Sustituye `'Tu nombre'` y `'Su nombre'` por sus nombres, manteniendo las comillas simples.
4. Cambia la fecha de ejemplo por el día y hora reales:

```sql
'2026-08-19T20:00:00-04:00'
```

Esto significa 19 de agosto de 2026, 20:00, zona UTC−4. Bolivia usa `-04:00`. Usa el desfase que corresponda al lugar y a la fecha que quieres representar. Si un nombre contiene apóstrofo, duplícalo dentro de SQL: `'D''Angelo'`.

5. Si quieres, cambia también la frase.
6. Copia **todo** el contenido del archivo.
7. En Supabase, entra a **SQL Editor → New query**.
8. Pega y pulsa **Run**.
9. Abre **Table Editor**. Debes encontrar `config`, `momentos`, `cartas` y `canciones`.
10. En `config`, comprueba que hay una fila con `id = 1` y tus datos.
11. Revisa que las cuatro tablas tengan **RLS enabled**.

Puedes ejecutar el script otra vez: conserva los datos y recrea sus políticas con los mismos nombres. Si ya existe la fila de `config`, volver a ejecutar el INSERT **no cambia** sus valores. Edítala desde Table Editor o desde el botón de ajustes de la app.

**Checkpoint:** cuatro tablas; `config` tiene una fila. Las otras están vacías y listas para tus recuerdos.

## 6. Preparar las fotos

1. En Supabase, abre **Storage → New bucket**.
2. Nombre exacto: **`momentos`**.
3. Activa **Public bucket** para que las fotos puedan verse sin login.
4. Si aparecen restricciones: tamaño máximo **5 MB**, tipos MIME **`image/*`**.
5. Crea el bucket.
6. En tu computadora, abre **`supabase/02-storage.sql`** y copia todo.
7. En **SQL Editor → New query**, pega y pulsa **Run**.

El bucket público permite ver las imágenes. Las políticas permiten subir, modificar y borrar solo con sesión. La app comprime las fotos antes de subirlas y almacena únicamente su nombre de archivo. [Referencia de buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets).

**Checkpoint:** existe el bucket `momentos` y ejecutaste las cuatro políticas.

## 7. Copiar los dos valores públicos de conexión

1. Ve a **Project Settings → Data API** y copia **Project URL**. También puede aparecer en **Connect**.
2. Tiene un formato similar a `https://abcdefghijklmnop.supabase.co`.
3. Ve a **Project Settings → API Keys**.
4. Copia la **Publishable key**, cuyo prefijo es `sb_publishable_`.
5. No copies **Secret key**, **service_role** ni la contraseña de la base de datos.

La clave publishable está diseñada para el navegador; RLS y la sesión controlan los permisos. No se incluye una fecha de retirada de claves heredadas porque puede cambiar. [Referencia de claves](https://supabase.com/docs/guides/getting-started/api-keys).

## 8. Conectar tu copia local

1. Detén el servidor local con **Ctrl + C** si sigue abierto.
2. Dentro del proyecto, ejecuta:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Si ya existe `.env.local`, ábrelo directamente; no necesitas volver a copiar la plantilla.

3. Completa las dos líneas, sin espacios alrededor de `=`:

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

4. Guarda y cierra el Bloc de notas. Revisa que el nombre sea `.env.local`, no `.env.local.txt`.
5. Arranca de nuevo:

```powershell
npm.cmd run dev
```

6. Abre la dirección de la terminal. Ahora aparecen sus nombres y secciones vacías: la muestra desaparece al usar datos reales.
7. Baja al final de la página y pulsa **tres veces seguidas el pequeño corazón**.
8. Entra con el correo y la contraseña que creaste en **Authentication → Users**.
9. Aparece una barra de edición abajo. Pulsa **+ Momento**.
10. Escribe título, fecha, descripción y elige o arrastra una foto. Guarda.
11. Comprueba que aparece en historia y galería. Recarga para comprobar que permanece.
12. Añade una carta con **+ Carta** y una canción con **+ Canción**.
13. Para canciones, pega enlaces HTTPS de Spotify o YouTube. En Spotify, el botón triangular abre el reproductor oficial. La flecha abre el enlace en otra pestaña.
14. El botón de ajustes cambia sus nombres, la fecha y la frase. La fecha del formulario usa la zona horaria de tu dispositivo.
15. Pulsa **Salir**: la barra de edición y los iconos desaparecen.

**Checkpoint:** tus cambios siguen allí después de recargar y puedes visitar sin sesión.

## 9. Crear un repositorio privado y subir el código

1. En GitHub, pulsa **+ → New repository**.
2. Nombre: `nuestro-rinconcito`.
3. Selecciona **Private**.
4. Deja sin marcar README, `.gitignore` y licencia: el proyecto ya trae sus archivos.
5. Pulsa **Create repository**.
6. Copia su URL HTTPS, por ejemplo `https://github.com/TU-USUARIO/nuestro-rinconcito.git`.
7. En PowerShell abre otra terminal o detén el servidor y ejecuta, reemplazando los ejemplos:

```powershell
cd "C:\Users\caezu\Desktop\teAmoLu"
git init
git config user.name "Tu Nombre"
git config user.email "tu-correo-de-github@ejemplo.com"
git check-ignore .env.local
```

8. El último comando debe mostrar `.env.local`. Significa que no se subirá. Si no muestra nada, revisa `.gitignore` antes de seguir.
9. Comprueba y crea la primera versión:

```powershell
npm.cmd test
npm.cmd run build
git add .
git status
```

10. Revisa que no aparezcan `.env.local`, `node_modules` ni `dist` entre los archivos preparados. Sí debe aparecer `.env.example`.
11. Ahora:

```powershell
git commit -m "Nuestro primer rinconcito"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/nuestro-rinconcito.git
git push -u origin main
```

12. Si se abre una ventana para iniciar sesión, usa tu cuenta de GitHub. GitHub no acepta la contraseña de la cuenta como contraseña para Git por HTTPS.
13. Si necesitas otra opción, instala [GitHub CLI](https://cli.github.com/), ejecuta `gh auth login`, selecciona GitHub.com, HTTPS y acceso desde navegador. Después repite `git push -u origin main`.
14. Actualiza el repositorio en el navegador. Debes ver `src`, `package.json`, la guía y los SQL.

Si dice `remote origin already exists`, revisa `git remote -v`. Solo si apunta al repositorio equivocado, usa `git remote set-url origin URL-CORRECTA`.

**Checkpoint:** el repositorio privado tiene el código, pero no tu `.env.local`.

## 10. Publicar en Vercel

1. Abre [Vercel](https://vercel.com/) e inicia sesión con GitHub.
2. Para una web personal, elige Hobby si se ajusta a sus condiciones vigentes.
3. Pulsa **Add New → Project**.
4. Busca `nuestro-rinconcito` y pulsa **Import**.
5. Si no aparece, entra a **Adjust GitHub App Permissions** y da acceso a ese repositorio.
6. Revisa estos valores:

| Campo            | Valor                                       |
| ---------------- | ------------------------------------------- |
| Framework Preset | Vite                                        |
| Root Directory   | raíz del repositorio, sin subcarpeta        |
| Build Command    | `npm run build`                             |
| Output Directory | `dist`                                      |
| Install Command  | automático, o `npm ci`                      |
| Node.js          | 22.x o una versión LTS compatible posterior |

7. Despliega **Environment Variables**.
8. Añade `VITE_SUPABASE_URL` con la URL del paso 7.
9. Añade `VITE_SUPABASE_PUBLISHABLE_KEY` con tu clave publishable.
10. Selecciona los entornos donde la usarás: **Production** y, si quieres probar ramas, **Preview**. Development sirve si luego descargas variables con la CLI.
11. Pulsa **Deploy** y espera a que termine.
12. Si termina correctamente, abre **Visit** o el dominio asignado `https://...vercel.app`.

Vercel detecta Vite y sirve `dist`. No se necesita `vercel.json`: esta app usa una sola página con anclas, sin rutas adicionales. [Referencia de Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).

Si añades o cambias variables después, ve a **Deployments → menú de los tres puntos del despliegue → Redeploy**. Las variables `VITE_` quedan incorporadas durante el build. [Referencia de variables](https://vercel.com/docs/environment-variables).

**Checkpoint:** el enlace de Vercel muestra los recuerdos que guardaste en local.

## 11. Ajustes finales

1. En Supabase abre **Authentication → URL Configuration**.
2. En **Site URL**, guarda el dominio público de Vercel. El login actual usa correo y contraseña directamente; este ajuste deja el proyecto listo para enlaces de autenticación si los incorporas después.
3. En Vercel, comprueba que estás compartiendo el dominio de **Production**, no una vista Preview protegida.
4. Si aparece una pantalla de acceso de Vercel, revisa **Settings → Deployment Protection** del proyecto y su alcance. La visita pública de esta especificación requiere que la producción permita visitantes; no cambies la protección de otros proyectos.
5. Si quieres otro subdominio, revisa **Settings → Domains** y las opciones disponibles para tu proyecto.
6. Abre la web desde tu teléfono usando la URL HTTPS de Vercel, no `localhost`.

## 12. Prueba antes de enviarle el enlace

- [ ] Nombres, frase y fecha correctos.
- [ ] Las fotos son las suyas, no las de ejemplo.
- [ ] En una ventana de incógnito se ven fotos, cartas y canciones.
- [ ] En incógnito no hay botones de edición.
- [ ] El corazón del pie abre el login con tres pulsaciones seguidas.
- [ ] Con sesión puedes crear, editar y borrar un **recuerdo de prueba**.
- [ ] Tras borrar ese recuerdo, su archivo desaparece del bucket `momentos`.
- [ ] Una carta nueva permanece tras recargar.
- [ ] Una canción abre Spotify/YouTube; Spotify también ofrece el reproductor.
- [ ] La galería funciona con botones, flechas del teclado y deslizamiento en móvil.
- [ ] El botón «Te amo» lanza corazones. Con movimiento reducido activado, no debe lanzarlos.
- [ ] Las cuatro tablas tienen RLS habilitado y las políticas correctas.
- [ ] Registro público e inicios de sesión anónimos desactivados; solo existen sus cuentas.
- [ ] No has subido claves secretas a GitHub ni a variables `VITE_`.

### Comprobar RLS desde SQL sin alterar recuerdos

En **SQL Editor**, puedes ejecutar esta prueba de escritura como visitante. Lo esperado es que informe que RLS bloqueó la escritura; cualquier fila de prueba se revierte al terminar:

```sql
begin;
set local role anon;
insert into public.momentos (titulo, fecha)
values ('Prueba RLS: no debe guardarse', current_date);
rollback;
```

Si la herramienta detiene la consulta al encontrar el error, ejecuta `rollback;` por separado. Si el INSERT funciona, revisa las políticas antes de compartir la URL. Esta comprobación es para las tablas; para Storage revisa también que INSERT/UPDATE/DELETE están limitados a `authenticated`.

## 13. Cambios en el futuro

**Fotos, cartas, canciones, nombres o fecha:** hazlos desde la web con sesión. Se guardan en Supabase, sin desplegar de nuevo. Otros visitantes los verán cuando recarguen.

**Diseño o código:** modifica los archivos y ejecuta:

```powershell
npm.cmd test
npm.cmd run build
git add .
git commit -m "Mejoras para nuestro rinconcito"
git push
```

Vercel iniciará un nuevo despliegue si la integración de GitHub está activa. Espera a que aparezca **Ready**.

## 14. Si algo no funciona

| Qué ocurre                           | Qué revisar                                                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Sigue apareciendo la muestra local   | Revisa el nombre `.env.local`, completa ambas variables y reinicia Vite.                                                |
| Vercel muestra «Casi listo»          | Faltan variables de conexión. Agrégalas y haz Redeploy.                                                                 |
| No carga ningún recuerdo             | Project URL/clave, estado de Supabase, SQL de tablas, RLS y fila `config` con id 1.                                     |
| No entra tu cuenta                   | Correo/contraseña correctos y usuario confirmado en Authentication → Users.                                             |
| Error de permisos al guardar         | Sesión activa y políticas para `authenticated` ejecutadas.                                                              |
| La foto no sube                      | Bucket exacto `momentos`, política INSERT y tipo de archivo compatible. Prueba JPG o PNG si HEIC falla en tu navegador. |
| Se guarda pero la foto no aparece    | Bucket público; `imagen_path` debe ser el nombre del archivo, no una URL.                                               |
| Aviso de archivo sin eliminar        | Ve a Storage → momentos y elimina el nombre indicado en el aviso, tras comprobar que es el archivo antiguo.             |
| El proyecto de Supabase está pausado | Abre su panel y utiliza **Restore/Resume**. No esperes que una visita lo restaure automáticamente.                      |
| Spotify no reproduce                 | Prueba abrir el enlace externo; puede depender del navegador, cuenta, región o restricciones del proveedor.             |
| `npm` bloqueado por PowerShell       | Usa `npm.cmd`, como en esta guía.                                                                                       |
| `git push` falla                     | Revisa sesión de GitHub, permisos del repositorio y `git remote -v`.                                                    |

Los proyectos Free de Supabase pueden pausarse por baja actividad durante siete días; revisa el panel si deja de cargar. [Referencia de pausas y restauración](https://supabase.com/docs/guides/platform/free-project-pausing).

Cuando completes los pasos, el enlace de Vercel será su rinconcito compartido. ♡
