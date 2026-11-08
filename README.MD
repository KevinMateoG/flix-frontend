# Flix Frontend

Aplicación web del proyecto **Flix** (plataforma de streaming de películas y series), construida con **Next.js**. Consume la API del [backend de Flix](https://github.com/KevinMateoG/flix-backend), usa Supabase y TMDB, y reproduce video con Mux.

- **Demo desplegada:** https://flix-murex-alpha.vercel.app
- Este repositorio es un fork de [EmanuelGarciaR/flix](https://github.com/EmanuelGarciaR/flix) y contiene **una sola aplicación**: el frontend.

---

## Tabla de contenido

1. [Tecnologías y versiones](#1-tecnologías-y-versiones)
2. [Estructura del repositorio](#2-estructura-del-repositorio)
3. [Requisitos](#3-requisitos)
4. [Cómo descargar el proyecto](#4-cómo-descargar-el-proyecto)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Ejecución local (sin Docker)](#6-ejecución-local-sin-docker)
7. [Ejecución con Docker](#7-ejecución-con-docker)
8. [Scripts disponibles](#8-scripts-disponibles)
9. [Pruebas end-to-end (Playwright)](#9-pruebas-end-to-end-playwright)
10. [Base de datos (Supabase)](#10-base-de-datos-supabase)
11. [Integración continua (Jenkins)](#11-integración-continua-jenkins)

---

## 1. Tecnologías y versiones

| Tecnología | Versión | Uso |
| --- | --- | --- |
| Node.js | 22 (imágenes `node:22-alpine` / `node:22-bookworm`) | Entorno de ejecución |
| Next.js | ^16.3.1 | Framework (App Router, salida `standalone`) |
| React / React DOM | 19.2.4 | Interfaz de usuario |
| TypeScript | ^5 | Lenguaje |
| Tailwind CSS | ^4 (`@tailwindcss/postcss`) | Estilos |
| GSAP + @gsap/react | ^3.15.0 / ^2.1.2 | Animaciones |
| Supabase (`supabase-js`, `@supabase/ssr`) | ^2.111.0 / ^0.12.3 | Base de datos y servicios |
| better-auth | ^1.7.7 | Autenticación |
| Mux (`@mux/mux-player-react`, `@mux/mux-node`) | ^3.2.0 / ^8.8.0 | Reproducción de video |
| lucide-react | ^1.26.0 | Iconos |
| date-fns, clsx, tailwind-merge | ^4.1.0, ^2.1.1, ^3.6.0 | Utilidades |
| ESLint | ^9 (`eslint-config-next` 16.2.11) | Análisis estático |
| Prettier | ^3.9.6 (`prettier-plugin-tailwindcss` ^0.8.1) | Formato de código |
| Playwright | 1.52.0 (instalado en el pipeline de CI) | Pruebas end-to-end |
| Docker / Docker Compose | — | Contenedores |
| Jenkins | — | Pipeline de CI/CD |

Servicios externos: [Supabase](https://supabase.com/), [TMDB](https://www.themoviedb.org/), [Mux](https://www.mux.com/) y el [backend de Flix](https://github.com/KevinMateoG/flix-backend). Despliegue en [Vercel](https://vercel.com/).

---

## 2. Estructura del repositorio

```
flix-frontend/
├── app/                      # Rutas y páginas (Next.js App Router)
├── components/               # Componentes de React
├── lib/                      # Utilidades y clientes de API
├── src/db/                   # Acceso a datos (p. ej. dislike.db.ts)
├── scripts/
│   └── test-tmdb.ts          # Script de prueba de la conexión con TMDB
├── supabase/
│   └── migrations/           # Migraciones SQL de Supabase
├── tests/
│   └── smoke.spec.js         # Pruebas end-to-end (Playwright)
├── Dockerfile                # Imagen multi-stage (deps, build, runtime)
├── docker-compose.yml        # Solo el frontend
├── docker-compose.dev.yml    # Stack completo: frontend + backend + PostgreSQL
├── Jenkinsfile               # Pipeline de CI/CD
├── next.config.ts
├── playwright.config.js
├── proxy.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── AGENTS.md / CLAUDE.md     # Instrucciones para asistentes de IA
└── package.json
```

---

## 3. Requisitos

**Para ejecutar con Docker:**

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose v2.
- El [backend de Flix](https://github.com/KevinMateoG/flix-backend) en ejecución (o usar `docker-compose.dev.yml`, que lo levanta).
- Un archivo `.env` con las variables de la [sección 5](#5-variables-de-entorno).

**Para ejecutar en local sin Docker:**

- [Node.js 22](https://nodejs.org/) y npm.
- Un proyecto de Supabase, y credenciales de TMDB y Mux.
- El backend de Flix en ejecución (por defecto en `http://localhost:3000`).

---

## 4. Cómo descargar el proyecto

### Opción A: clonar el repositorio

```bash
git clone https://github.com/KevinMateoG/flix-frontend.git
cd flix-frontend
```

### Opción B: descargar la imagen desde Docker Hub

```bash
docker pull kevinmateog/flix-frontend:latest
```

---

## 5. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (está en `.gitignore` y `.dockerignore`, **no lo subas al repositorio**).

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<url-del-proyecto-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# TMDB
TMDB_API_KEY=<tu-api-key>
TMDB_READ_ACCESS_TOKEN=<tu-token>
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Mux
MUX_TOKEN_ID=<tu-token-id>
MUX_TOKEN_SECRET=<tu-token-secret>
NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN=<dominio-de-reproducción>

# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:5173
BACKEND=http://localhost:3000
PORT=5173
```

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | URL y clave pública (anon) de tu proyecto Supabase. |
| `TMDB_API_KEY` / `TMDB_READ_ACCESS_TOKEN` | Credenciales de la API de TMDB. |
| `TMDB_BASE_URL` | URL base de la API de TMDB. |
| `TMDB_IMAGE_BASE_URL` | URL base de las imágenes de TMDB (`next.config.ts` solo permite `image.tmdb.org/t/p/**`). |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | Credenciales de la API de Mux. |
| `NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN` | Dominio de reproducción de Mux. |
| `NEXT_PUBLIC_APP_URL` | URL pública del frontend. |
| `BACKEND` | URL del backend de Flix. |
| `PORT` | Puerto del frontend (por defecto `5173`). |

> Las variables `BACKEND` y `NEXT_PUBLIC_URL` también se reciben como argumentos de build en el `Dockerfile` (`--build-arg`), con valores por defecto `http://host.docker.internal:3000` y `http://localhost:5173`.

---

## 6. Ejecución local (sin Docker)

```bash
# 1. Instalar dependencias
npm ci

# 2. Configurar el archivo .env (ver sección 5)

# 3. Asegurarse de que el backend esté corriendo en la URL indicada en BACKEND

# 4. Iniciar en modo desarrollo
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

**Compilar y ejecutar en modo producción:**

```bash
npm run build
npm start
```

---

## 7. Ejecución con Docker

### 7.1. Solo el frontend (`docker-compose.yml`)

Usa la imagen `kevinmateog/flix-frontend` de Docker Hub. Requiere que el backend ya esté corriendo en el puerto `3000` del host (el contenedor lo alcanza mediante `host.docker.internal`).

```bash
docker compose up -d

# Ver logs
docker compose logs -f frontend

# Detener
docker compose down
```

- Aplicación: `http://localhost:5173`

### 7.2. Stack completo (`docker-compose.dev.yml`)

Levanta frontend, backend y PostgreSQL 17 con un solo comando. Lee los archivos `.env` de **ambos** repositorios, por lo que deben estar clonados **uno al lado del otro**:

```
proyecto/
├── flix-backend/     # con su .env
└── flix-frontend/    # con su .env
```

```bash
cd flix-frontend
docker compose -f docker-compose.dev.yml up -d
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

En este modo el frontend se comunica con el backend por la red interna de Docker (`BACKEND=http://backend:3000`) y espera a que el backend esté saludable antes de iniciar.

### 7.3. Construir la imagen manualmente

```bash
docker build \
  --build-arg BACKEND=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_URL=http://localhost:5173 \
  -t kevinmateog/flix-frontend:latest .
```

El `Dockerfile` tiene tres etapas (`deps`, `builder` y `runner`). La imagen final usa `node:22-alpine`, corre con un usuario sin privilegios, ejecuta el servidor `standalone` de Next.js (`node server.js`) y expone el puerto `5173`.

---

## 8. Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 5173. |
| `npm run build` | Compila la aplicación para producción. |
| `npm start` | Ejecuta la build de producción. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run format` | Formatea el código con Prettier. |
| `npm run format:check` | Verifica el formato sin modificar archivos. |

---

## 9. Pruebas end-to-end (Playwright)

Las pruebas están en `tests/` (`smoke.spec.js`) y se configuran en `playwright.config.js` (navegador Chromium, URL base `http://127.0.0.1:5173`, configurable con `PLAYWRIGHT_BASE_URL`).

`@playwright/test` no está en el `package.json`; el pipeline de CI lo instala puntualmente. Para correr las pruebas en local:

```bash
# 1. Compilar y levantar la aplicación en el puerto 5173
npm run build
npm start    # o: npm run dev

# 2. En otra terminal: instalar Playwright y ejecutar las pruebas
npm install --no-save --package-lock=false --ignore-scripts @playwright/test@1.52.0
npx playwright install --with-deps chromium
npx playwright test
```

El reporte HTML se genera en `playwright-report/`.

---

## 10. Base de datos (Supabase)

Las migraciones SQL se encuentran en `supabase/migrations/`:

| Migración | Descripción |
| --- | --- |
| `20260725210000_profiles_table.sql` | Tabla de perfiles |
| `20260726000001_watch_history.sql` | Historial de reproducción |
| `20260726000002_my_list.sql` | Lista personal (“Mi lista”) |
| `20260726000003_profiles_region.sql` | Región en perfiles |
| `20260728000004_watch_history_unique_identity.sql` | Identidad única en el historial |
| `20260730000005_dislikes.sql` | “No me gusta” |

Para aplicarlas a tu proyecto con la [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

---

## 11. Integración continua (Jenkins)

El `Jenkinsfile` define un pipeline con las siguientes etapas:

1. **Npm Install**: `npm ci` dentro de `node:22-bookworm`.
2. **Build**: `npm run build`.
3. **Playwright Test**: instala Playwright y Chromium, levanta el servidor `standalone` en `127.0.0.1:5173`, espera a que `/login` responda y ejecuta las pruebas.
4. **Docker Build**: construye la imagen (`--build-arg BACKEND=http://localhost:3000`) con las etiquetas `kevinmateog/flix-frontend:$BUILD_NUMBER` y `kevinmateog/flix-frontend:latest`.
5. **Docker Push**: inicia sesión en Docker Hub y publica `kevinmateog/flix-frontend:latest`.

**Requisitos del servidor Jenkins:** Docker instalado y accesible para el agente, y una credencial de tipo *Username with password* con ID `dockerHub` que contenga las credenciales de Docker Hub.

---

## Repositorios relacionados

- Backend: [KevinMateoG/flix-backend](https://github.com/KevinMateoG/flix-backend)
- Proyecto original (fork): [EmanuelGarciaR/flix](https://github.com/EmanuelGarciaR/flix)