# LinkVote 🗳️

Aplicación web progresiva (PWA) de código abierto para gestionar y realizar votaciones/elecciones empresariales de forma segura. Construida con **React**, **Express**, **PostgreSQL** y **TypeScript**.

## Características

- **Gestión de campañas** — Crear, editar, activar/desactivar campañas de votación con fechas personalizadas, descripciones e imágenes de portada.
- **Gestión de candidatos** — Agregar, editar y eliminar candidatos por campaña; los candidatos con votos no se pueden eliminar.
- **Enlaces únicos de votación** — Cada campaña genera un slug URL único; compatible con códigos QR para compartir fácilmente.
- **Votación segura** — Los votantes se identifican con un ID único; se garantiza un voto por persona por campaña mediante restricción única en base de datos.
- **Resultados en tiempo real** — La página de resultados se auto-refresca cada 10 segundos con barras de progreso animadas, porcentajes y líder indicado.
- **Celebración con confeti** — Animación `canvas-confetti` al emitir un voto exitosamente.
- **Carga de imágenes** — Subida de archivos con Multer para imágenes de campaña y candidatos (JPEG/JPG/PNG/WebP, máx. 5 MB).
- **Autenticación JWT** — Inicio de sesión de administradores con token almacenado en localStorage; rutas API protegidas.
- **Tema oscuro/claro** — Alternancia con detección de preferencia del sistema, persistido en localStorage.
- **Diseño responsive** — Enfoque mobile-first con sidebar en escritorio y bottom sheet en móvil.
- **UI pulida** — Glassmorphism, animaciones con Framer Motion, componentes shadcn/ui.
- **Despliegue con Docker** — Docker Compose con PostgreSQL + Node.js + Nginx.

## Tecnologías

| Categoría | Tecnologías |
|---|---|
| **Runtime** | Node.js 20+ |
| **Lenguaje** | TypeScript |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Framer Motion 11 |
| **Backend** | Express 5 |
| **Base de datos** | PostgreSQL 15, Drizzle ORM |
| **Validación** | Zod (compartido frontend/backend) |
| **Autenticación** | JWT + bcryptjs |
| **Estado/Datos** | TanStack React Query 5 |
| **UI** | Radix UI + shadcn/ui |
| **Contenedores** | Docker + Docker Compose + Nginx |

## Requisitos

- Node.js 20+
- PostgreSQL 15+
- npm

## Inicio rápido

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/vote_manager
JWT_SECRET=tu-secreto-jwt
PORT=5000
```

### 3. Inicializar la base de datos

```bash
npm run db:push
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

Esto inicia el servidor Express con Vite HMR en `http://localhost:5000`.

### 5. Construir para producción

```bash
npm run build
npm start
```

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo con HMR |
| `npm run build` | Compila cliente (Vite) y servidor (esbuild) |
| `npm start` | Inicia servidor en producción |
| `npm run check` | Ejecuta TypeScript type-checking |
| `npm run db:push` | Sincroniza esquema Drizzle con la base de datos |

## Docker

```bash
docker-compose up --build
```

Esto levanta PostgreSQL, la aplicación y Nginx en `http://localhost:8000`.

## API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | — | Inicio de sesión de administrador |
| POST | `/api/auth/register` | — | Registrar nuevo administrador |
| GET | `/api/auth/me` | JWT | Obtener usuario actual |
| GET | `/api/campaigns` | JWT | Listar campañas |
| POST | `/api/campaigns` | JWT | Crear campaña |
| GET | `/api/campaigns/:id` | JWT | Obtener campaña |
| GET | `/api/campaigns/link/:uniqueLink` | — | Obtener campaña por enlace público |
| PUT | `/api/campaigns/:id` | JWT | Actualizar campaña |
| GET | `/api/results/campaign/:id` | JWT | Resultados de campaña |
| GET | `/api/campaigns/:campaignId/candidates` | — | Listar candidatos |
| POST | `/api/campaigns/:campaignId/candidates` | JWT | Agregar candidato |
| PUT | `/api/campaigns/:campaignId/candidates/:id` | JWT | Actualizar candidato |
| DELETE | `/api/campaigns/:campaignId/candidates/:id` | JWT | Eliminar candidato |
| POST | `/api/votes` | — | Emitir voto |
| POST | `/api/upload` | JWT | Subir imagen |

## Rutas del frontend

| Ruta | Descripción |
|---|---|
| `/` | Página de inicio |
| `/admin/login` | Inicio de sesión de administrador |
| `/admin` | Panel de administración |
| `/admin/campaigns/new` | Crear nueva campaña |
| `/admin/campaigns/:id` | Gestionar campaña (candidatos, resultados, QR) |
| `/vote/:uniqueLink` | Página pública de votación |

## Credenciales por defecto

- **Usuario:** `admin`
- **Contraseña:** `admin_password_123`

## Licencia

MIT
