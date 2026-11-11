# Flix — Frontend (Plataforma de Streaming de Películas y Series)

Aplicación web frontend de **Flix**, una plataforma full-stack de streaming y descubrimiento de películas y series desarrollada como Proyecto de Aula de Desarrollo Web Full-Stack (2026-2). Construida con **Next.js (App Router)**, **React**, **TypeScript** y **Tailwind CSS** bajo una arquitectura limpia organizada por *features*.

Se conecta a la API REST del [backend de Flix](https://github.com/KevinMateoG/flix-backend), la cual utiliza **Neon (PostgreSQL Serverless)** como base de datos en la nube y **Better Auth** para la gestión de autenticación, sesiones y control de acceso basado en roles (`admin` y `user`). Además, integra el catálogo de **TMDB**, almacenamiento de imágenes en un **Bucket S3** y reproducción de video con **Mux**.

---

## Tabla de contenido

1. [Enlaces del proyecto y despliegues en producción](#1-enlaces-del-proyecto-y-despliegues-en-producción)
2. [Credenciales de prueba (Seed)](#2-credenciales-de-prueba-seed)
3. [Reparto del trabajo](#3-reparto-del-trabajo)
4. [Descripción del dominio, recursos y roles](#4-descripción-del-dominio-recursos-y-roles)
5. [Arquitectura del Frontend](#5-arquitectura-del-frontend)
6. [Vistas, UX y Protección de Rutas](#6-vistas-ux-y-protección-de-rutas)
7. [Tecnologías utilizadas](#7-tecnologías-utilizadas)
8. [Requisitos previos](#8-requisitos-previos)
9. [Variables de entorno](#9-variables-de-entorno)
10. [Instalación y ejecución local](#10-instalación-y-ejecución-local)
11. [Scripts disponibles](#11-scripts-disponibles)

---

## 1. Enlaces del proyecto y despliegues en producción

| Elemento | Plataforma | Enlace |
| --- | --- | --- |
| **Frontend desplegado (Producción)** | Vercel | `[PEGAR_LINK_FRONTEND_VERCEL_AQUI]` |
| **Backend / API desplegada (Producción)** | Vercel / Cloud | `[PEGAR_LINK_BACKEND_VERCEL_AQUI]` |
| **Repositorio Frontend** | GitHub | [https://github.com/KevinMateoG/flix-frontend](https://github.com/KevinMateoG/flix-frontend) |
| **Repositorio Backend** | GitHub | [https://github.com/KevinMateoG/flix-backend](https://github.com/KevinMateoG/flix-backend) |

---

## 2. Credenciales de prueba (Seed)

Tras ejecutar `npm run db:seed` en el backend (conectado a **Neon PostgreSQL**), se crean las siguientes cuentas de prueba (contraseña para todas: `Flix1234!`):

| Rol | Correo | Contraseña | Descripción |
| --- | --- | --- | --- |
| `admin` | `test1@flix.local` | `Flix1234!` | Acceso completo al catálogo y al panel administrativo (`/admin`) para crear, editar y eliminar (borrado lógico) contenido |
| `user` | `test2@flix.local` | `Flix1234!` | Usuario estándar con acceso a catálogo, reproducción, Mi Lista, historial y perfil (recibe `403 Forbidden` en endpoints de admin y es redirigido fuera de `/admin`) |

---

## 3. Reparto del trabajo

| Integrante | Responsabilidades y módulos construidos |
| --- | --- |
| **Juan José Ocampo** | • **CRUD completo en 3 recursos propios, borrado lógico y paginación `{ data, pagination }`:** Implementación de operaciones completas (`GET`, `POST`, `PUT/PATCH`, `DELETE`) y borrado lógico (`status` / `isActive`) sobre los recursos del dominio.<br>• **Paginación estándar y filtros:** Estandarización de respuestas paginadas `{ data, pagination: { total, currentPage, limit, totalPages } }` con validación de query params numéricos positivos (`page`, `limit`) y filtros por consulta.<br>• **Integración de catálogo paginado y control de rol:** Soporte de la respuesta paginada desde `/api/movies` en el catálogo y protección de la ruta `/admin` por rol en la arquitectura por features (`f87f423`, `63cbdd5`). |
| **Emanuel García Ríos** | • **Subida de imágenes como archivo a Bucket S3:** Implementación del flujo y endpoints para subir archivos de imagen (foto de perfil en registro/edición de perfil y recursos gráficos) hacia un bucket S3 y persistir la URL resultante en **Neon PostgreSQL**.<br>• **Autenticación, sesiones y redirección de rutas:** Gestión de sesiones con **Better Auth**, limpieza de cookies al cerrar sesión, protección de todas las rutas privadas y redirección automática en `/login` y `/register` cuando existe o no una sesión activa (`b12316e`, `09106ff`, `ba44f25`, `91a1022`).<br>• **Control de acceso regional y modo demo:** Restricción de contenido por región del perfil y conmutador de modo demo en inicio y exploración (`e173b23`, `eb571c8`). |
| **Kevin Mateo Gómez** | • **Migración a Arquitectura Limpia por Features:** Reestructuración integral del frontend en módulos por dominio (`auth`, `catalog`, `home`, `history`, `library`, `playback`, `profile`, `tmdb`, `admin`, `common`) separando `domain/`, `services/`, `hooks/` y `components/` (`60d02b0`, `abfea7a`, `8f48d80`, `89edbf4`, `9655b14`, `5aa0851`).<br>• **Proxy, Middlewares y Migración a Neon Cloud:** Implementación de `proxy.ts` para el enrutamiento hacia el backend y validación centralizada de sesiones y roles con Better Auth (`e97e522`, `2ecced1`), integración de avatares S3 en registro/perfil/header (`7a21468`) y migración de la base de datos a **Neon**.<br>• **Landing Page (`/`) y Página 404 (`not-found.tsx`):** Diseño e implementación de la página de inicio pública (`LandingView`) con presentación del proyecto y vista personalizada `NotFoundView` (`114dd02`, `f556497`). |
| **Kevin Cifuentes** | • **Vista y Panel de Administración (`/admin`):** Diseño e implementación de la interfaz administrativa (`AdminView`) para gestionar el catálogo reproducible (creación, edición, cambio de estado/borrado lógico con confirmación y visualización paginada).<br>• **Calidad de código y estructura base:** Estandarización de estilos, formato con Prettier/ESLint y organización de directorios bajo prácticas de código limpio (`481cdc3`, `3ed500e`, `e89c7b1`, `ff38cb2`, `afdd74a`). |

---

## 4. Descripción del dominio, recursos y roles

**Flix** es una plataforma de streaming que permite a los usuarios explorar un catálogo de películas y series adaptado a su región e idioma, reproducir contenido y avances, gestionar su lista de favoritos y retomar la reproducción donde la dejaron, mientras los administradores gestionan el catálogo reproducible de la plataforma.

### Recursos principales del sistema
1. **Usuarios y Autenticación (`/api/auth/*`):** Registro, inicio de sesión, cierre de sesión, recuperación de contraseña y manejo de sesiones persistentes mediante **Better Auth** en **Neon PostgreSQL**.
2. **Catálogo reproducible (`/api/movies`):** Recurso principal administrable con CRUD completo (`GET`, `POST`, `PUT/PATCH`, `DELETE`), borrado lógico, filtros y paginación estándar `{ data, pagination }`.
3. **Mi Lista y Preferencias (`/api/my-list`, `/api/dislikes`):** Colección personal de películas y series favoritas y registro de preferencias del usuario autenticado.
4. **Historial de reproducción y Perfiles (`/api/watch-history`, `/api/profile`):** Seguimiento de progreso de visualización por título/episodio y configuración del perfil del usuario (idioma, región, filtro de edad, modo infantil y subida de foto de perfil como archivo a **Bucket S3**).

### Roles de usuario
| Rol | Permisos |
| --- | --- |
| `admin` | Gestionar todos los recursos del catálogo desde el panel `/admin` (crear, editar, activar/desactivar mediante borrado lógico) además de todas las funciones de usuario. Se crea mediante el script `seed`. |
| `user` | Registrarse, iniciar sesión, explorar el catálogo, reproducir contenido, gestionar *Mi Lista*, su historial de reproducción y personalizar su perfil y avatar. |

---

## 5. Arquitectura del Frontend

El repositorio sigue la arquitectura exigida en el curso combinando **Next.js App Router** (donde los archivos `app/**/page.tsx` únicamente componen vistas) y una organización modular por **features** en `src/features/`:

```text
flix-frontend/
├── app/                              # Rutas del App Router (solo composición)
│   ├── (auth)/                       # Rutas públicas de autenticación (/login, /register, /forgot-password, /reset-password)
│   ├── (main)/                       # Rutas protegidas (/home, /browse, /movie/[id], /tv/[id], /watch/[id], /my-list, /profile, /settings, /search, /admin)
│   ├── api/search/                   # Endpoint auxiliar de búsqueda
│   ├── layout.tsx                    # Layout raíz
│   ├── not-found.tsx                 # Página 404 personalizada
│   └── page.tsx                      # Landing Page pública (/)
├── src/
│   └── features/
│       ├── common/                   # Configuración global (config.ts), cliente HTTP centralizado (http.ts) y componentes UI reutilizables
│       ├── auth/                     # Autenticación y sesión (Better Auth)
│       ├── admin/                    # Panel de administración del catálogo
│       ├── catalog/                  # Exploración y detalle de películas y series
│       ├── home/                     # Landing page y vista principal de inicio
│       ├── history/                  # Historial de reproducción ("Continuar viendo")
│       ├── library/                  # Gestión de "Mi Lista" y valoraciones
│       ├── playback/                 # Reproductores de video (Mux y YouTube)
│       ├── profile/                  # Perfil de usuario, preferencias y subida de avatar a S3
│       └── tmdb/                     # Búsqueda, filtrado regional e integración con TMDB
│           ├── domain/               # Tipos, modelos e interfaces de TypeScript
│           ├── services/             # Llamadas a la API mediante el cliente HTTP centralizado
│           ├── hooks/                # Estado y lógica de presentación en React
│           └── components/           # Componentes de interfaz desacoplados
├── proxy.ts                          # Middleware/Proxy de Next.js para protección de rutas y redirección a la API
├── next.config.ts
├── eslint.config.mjs
├── tsconfig.json
└── package.json
```

### Consumo centralizado de la API
- Ningún componente realiza llamadas `fetch` directas: toda comunicación pasa por los servicios (`services/`) consumidos desde hooks personalizados (`hooks/`).
- El cliente HTTP centralizado en `src/features/common/http.ts` (`fetchApi` en servidor y `fetchClientApi` en cliente) toma la URL base desde `NEXT_PUBLIC_API_HOST` / `BACKEND`, adjunta automáticamente las cookies de sesión en cada petición y, si el backend responde `401 Unauthorized`, redirige automáticamente al usuario a `/login`.

---

## 6. Vistas, UX y Protección de Rutas

### Vistas implementadas
- **Landing Page (`/`):** Página de presentación del proyecto con información sobre la experiencia, audiencia, beneficios y llamados a la acción.
- **Autenticación (`/login`, `/register`, `/forgot-password`, `/reset-password`):** Formularios con validaciones, visualización de errores del backend en la interfaz (sin `alert`) y carga de foto de perfil como archivo en el registro.
- **Inicio y Exploración (`/home`, `/browse`, `/search`):** Listados principales con filtros por género/tipo, modo regional, búsqueda en tiempo real y estados de carga (*skeletons*), vacío (`EmptyState`) y error.
- **Detalle y Reproducción (`/movie/[id]`, `/tv/[id]`, `/watch/[id]`):** Fichas completas con reparto, selector de temporadas/episodios y reproductor integrado.
- **Perfil y Mi Lista (`/profile`, `/settings`, `/my-list`):** Edición de preferencias, actualización/eliminación de avatar en S3 y gestión de favoritos.
- **Administración (`/admin`):** Vista exclusiva para el rol `admin` con listado paginado, creación, edición y eliminación (borrado lógico) con confirmación previa.
- **Página 404 (`app/not-found.tsx`):** Vista personalizada para rutas inexistentes.

### Protección de rutas (`proxy.ts` y Layouts)
- **Sin sesión activa:** Cualquier intento de acceder a `/home`, `/browse`, `/movie/*`, `/tv/*`, `/watch/*`, `/my-list`, `/profile`, `/settings`, `/search` o `/admin` (incluso escribiendo la URL manualmente) redirige a `/login`.
- **Con sesión activa:** Si un usuario autenticado entra a `/login` o `/register`, es redirigido automáticamente a `/home`.
- **Control por rol:** La ruta `/admin` verifica que `session.user.role === 'admin'`; si un usuario con rol `user` intenta acceder, es redirigido a `/home`.

### Bonificaciones incluidas
- **Internacionalización (i18n):** Interfaz disponible en 3 idiomas (**Español**, **Inglés** y **Portugués**) mediante `LanguageProvider` y `useLanguage`.
- **Filtros combinados:** Filtrado por búsqueda de texto, tipo de contenido (películas/series), género, clasificación por edad y región.
- **Animaciones y tema oscuro:** Diseño nativo en modo oscuro de alto contraste y microinteracciones fluidas.

---

## 7. Tecnologías utilizadas

| Tecnología | Versión | Uso en el proyecto |
| --- | --- | --- |
| **Next.js** | ^16.3.1 | Framework React con App Router |
| **React / React DOM** | 19.2.4 | Construcción de la interfaz de usuario |
| **TypeScript** | ^5 | Tipado estático en toda la aplicación |
| **Tailwind CSS** | ^4 | Sistema de diseño y estilos responsivos |
| **Better Auth** | ^1.7.7 | Autenticación, sesiones persistentes y roles |
| **Neon PostgreSQL** | Serverless (vía Backend) | Base de datos relacional en la nube |
| **Mux Player** | ^3.2.0 | Reproducción de video en streaming |
| **GSAP** | ^3.15.0 | Animaciones y transiciones |
| **Lucide React** | ^1.26.0 | Iconografía |
| **ESLint + Prettier** | ^9 / ^3.9.6 | Calidad y formato uniforme del código |

---

## 8. Requisitos previos

- **Node.js** 22 o superior y **npm**.
- El [backend de Flix](https://github.com/KevinMateoG/flix-backend) en ejecución (por defecto en `http://localhost:3000`), conectado a **Neon PostgreSQL** y con **Better Auth** y el **Bucket S3** configurados.
- Clave de API de **TMDB**.

---

## 9. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (el archivo `.env` real está en `.gitignore` y **nunca se sube al repositorio**):

```env
# Conexión con la API del Backend
NEXT_PUBLIC_API_HOST=http://localhost:3000
BACKEND=http://localhost:3000
NEXT_PUBLIC_URL=http://localhost:5173

# TMDB (Catálogo complementario e imágenes)
TMDB_API_KEY=<tu-api-key-de-tmdb>
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Mux (Reproducción de video)
NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN=stream.mux.com
NEXT_PUBLIC_MUX_TEST_PLAYBACK_ID=demo-stream
```

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_HOST` / `BACKEND` | URL base del backend de Flix (por defecto `http://localhost:3000`). |
| `NEXT_PUBLIC_URL` | URL pública del frontend (por defecto `http://localhost:5173`). |
| `TMDB_API_KEY` | Clave de acceso a la API de The Movie Database (TMDB). |
| `TMDB_BASE_URL` | URL base de la API v3 de TMDB. |
| `TMDB_IMAGE_BASE_URL` | URL base para las imágenes y pósters de TMDB. |
| `NEXT_PUBLIC_MUX_PLAYBACK_DOMAIN` | Dominio de reproducción de streams en Mux. |
| `NEXT_PUBLIC_MUX_TEST_PLAYBACK_ID` | ID de reproducción de respaldo para modo demostración. |

---

## 10. Instalación y ejecución local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/KevinMateoG/flix-frontend.git
   cd flix-frontend
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Crea el archivo `.env` en la raíz siguiendo la [sección 9](#9-variables-de-entorno).

4. **Ejecutar el servidor de desarrollo:**
   Asegúrate de que el backend esté corriendo (con las migraciones y `npm run db:seed` aplicados en Neon) y ejecuta:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

5. **Compilar y ejecutar para producción:**
   ```bash
   npm run build
   npm start
   ```

---

## 11. Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo de Next.js en el puerto `5173`. |
| `npm run build` | Compila la aplicación para producción validando tipos de TypeScript. |
| `npm start` | Inicia el servidor de producción tras ejecutar `npm run build`. |
| `npm run lint` | Ejecuta ESLint para verificar la calidad del código. |
| `npm run format` | Formatea automáticamente el código con Prettier. |
| `npm run format:check` | Verifica el formato del código sin modificar los archivos. |
