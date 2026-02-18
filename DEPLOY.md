# Guía de Despliegue (Deploy)

Para poner tu web disponible en internet, seguiremos estos pasos usando **GitHub** y **Vercel** (gratuito y fácil).

## 1. Preparar el código (Git)

Abre la terminal en tu carpeta del proyecto y ejecuta:

```bash
# Inicializar Git
git init

# Agregar todos los archivos (el .gitignore evitará subir claves secretas)
git add .

# Guardar el primer commit
git commit -m "Versión MVP terminada"
```

## 2. Subir a GitHub

1. Ve a [GitHub.com](https://github.com) y crea una cuenta si no tienes.
2. Inicia sesión y crea un **Nuevo Repositorio** (botón "+", "New repository").
3. Ponle nombre `PortalDeLuz` (o el que quieras).
4. **No** selecciones "Initialize with README" ni ".gitignore".
5. Copia los comandos que te salen en la sección "...or push an existing repository from the command line". Serán algo así:

```bash
git remote add origin https://github.com/TU_USUARIO/PortalDeLuz.git
git branch -M main
git push -u origin main
```

## 3. Desplegar en Vercel

1. Ve a [Vercel.com](https://vercel.com) y crea una cuenta (puedes usar "Continue with GitHub").
2. En tu Dashboard, haz clic en **Add New...** -> **Project**.
3. Selecciona tu repositorio `PortalDeLuz` y haz clic en **Import**.
4. En **Environment Variables**, agrega las variables de Supabase (las tienes en tu archivo `.env.local`):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `tu-clave-anon-larga...` |

5. Haz clic en **Deploy**.

## 4. Configurar URL en Supabase

Una vez desplegado, Vercel te dará una URL (ej: `portal-de-luz.vercel.app`).

1. Ve a **Supabase Dashboard** > Authentication > URL Configuration.
2. En **Site URL**, pon la nueva URL de Vercel.
3. En **Redirect URLs**, agrega `https://portal-de-luz.vercel.app/**`.

¡Listo! Tu web ya es accesible desde cualquier lugar.
