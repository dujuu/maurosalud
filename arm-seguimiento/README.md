# Sistema de seguimiento y fidelización de tratamientos

Centro Médico Vida Norte SpA · Equipo ARM Systems · IP Santo Tomás (Arica)

Avance 1: inicio de sesión por RUT con dos roles (doctor y paciente) y el flujo
*el doctor envía una recomendación a uno de sus pacientes, el paciente la ve y la marca como leída, y el doctor ve que fue leída*.
El resumen del doctor se calcula con las recomendaciones reales; no hay cifras de ejemplo.

## Tecnología

| Capa | Herramienta |
|---|---|
| Base de datos | MariaDB 12 |
| Backend | NestJS 12, TypeORM 1.1, JWT, bcryptjs |
| Frontend | Angular 22, Angular Material 22 (Material 3), Chart.js con ng2-charts |
| Tipografías | Atkinson Hyperlegible Next (texto), Montserrat (solo el logo), Material Symbols (íconos) |
| Lenguaje | TypeScript 6 |

El tema de color se generó con `ng generate @angular/material:m3-theme` a partir de los colores del logo (`#0B8794`, `#0A4E99`, `#0A6FAA`).

## Puesta en marcha

Requisitos: Node 22 o superior y MariaDB en ejecución.

### 1. Base de datos (una sola vez)
```bash
sudo mariadb -e "CREATE DATABASE IF NOT EXISTS vida_norte CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'arm_app'@'localhost' IDENTIFIED BY '<DB_PASS>';
GRANT ALL PRIVILEGES ON vida_norte.* TO 'arm_app'@'localhost'; FLUSH PRIVILEGES;"
```

### 2. Backend (http://localhost:3000/api)
```bash
cd backend
cp .env.example .env        # completar DB_PASS (la misma de arriba) y JWT_SECRET
npm install
npm run migration:run       # crea las tablas
npm run seed                # usuarios y recomendaciones de demostración (repetible, no duplica)
npm run start:dev
```

### 3. Frontend (http://localhost:4200)
```bash
cd frontend
npm install
npm start                    # usa proxy.conf.json: /api va a localhost:3000
# si el puerto 4200 está ocupado: npm start -- --port 4201
```

## Usuarios de demostración
La contraseña de todos es `Vida2026`. En `ng serve` la pantalla de login muestra un panel para entrar con un clic.

| Rol | Nombre | RUT | Relación |
|---|---|---|---|
| Doctor | Dr. Rodrigo Salas (Medicina General) | 12.345.678-5 | Pacientes: Ana Muñoz y Carlos Pérez |
| Doctora | Dra. Paula Contreras (Kinesiología) | 14.567.890-0 | Pacientes: Carlos Pérez y Sofía Araya |
| Paciente | Ana Muñoz | 16.789.012-1 | Del Dr. Salas |
| Paciente | Carlos Pérez | 18.234.567-9 | De ambos doctores |
| Paciente | Sofía Araya | 19.345.678-2 | De la Dra. Contreras |

Los RUT son ficticios, con dígito verificador válido. El seed deja 8 recomendaciones de ejemplo (algunas leídas y otras no).
Para volver a dejar la demostración como nueva: `npm run seed:reset`.

## Guion de demostración
La sesión se guarda **por pestaña**: se pueden abrir dos pestañas con usuarios distintos a la vez.

1. Pestaña 1: entrar como el Dr. Salas. En *Pacientes* aparecen solo Ana y Carlos, con sus pendientes de lectura.
2. Pestaña 2: entrar como Ana. Muestra "Tiene 1 recomendación sin leer".
3. En la pestaña 1, escribir una recomendación a Ana y enviarla.
4. En la pestaña 2, en 20 segundos como máximo, la recomendación aparece sola. Pulsar *Marcar como leída*.
5. En la pestaña 1, el hilo de Ana pasa a "Leída" sin recargar. La pestaña *Resumen* se actualiza con los números reales.
6. Entrar como la Dra. Contreras y enviarle algo a Carlos: él verá recomendaciones de dos doctores.

## API (`/api`)

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/login` | público | `{rut, password}` devuelve token y usuario |
| GET | `/auth/me` | cualquiera | id, rol y nombre del usuario, según la base de datos |
| GET | `/doctor/pacientes` | DOCTOR | solo los pacientes asignados al doctor |
| POST | `/recomendaciones` | DOCTOR | crea; 403 si el paciente no es suyo |
| GET | `/recomendaciones/emitidas` | DOCTOR | las que envió, con `leidaAt` |
| GET | `/recomendaciones/mias` | PACIENTE | las que recibió, de cualquier doctor |
| PATCH | `/recomendaciones/:id/leida` | PACIENTE | marca como leída; 404 si no es suya; idempotente |

Cada petición se valida contra la base de datos: un usuario desactivado o inexistente pierde el acceso de inmediato, aunque su token no haya vencido.

## Base de datos
Tablas (migraciones en `backend/src/database/migrations`): `usuarios`, `doctor_paciente`, `recomendaciones`.
Las fechas se guardan en UTC y el frontend las muestra en hora local.

```bash
npm run migration:show      # estado
npm run migration:revert    # deshace la última
```

`synchronize` está desactivado: el esquema solo cambia con migraciones.

## Documentación
- **API interactiva (Swagger / OpenAPI):** con el backend en marcha, abrir http://localhost:3000/api/docs. Permite probar cada ruta
  (botón *Authorize* con el token del login). La especificación en JSON está en `/api/docs-json`. No se publica si `NODE_ENV=production`.
- **Código (TSDoc):** todos los archivos llevan comentarios `/** ... */` en español. Para generar el sitio de referencia:
  `npm run docs` en `backend` y en `frontend` (se escribe en `docs/codigo/`; abrir `index.html`).
- **Flujos, diagramas de secuencia y casos de uso:** `docs/Diagramas_de_Secuencia_y_Casos_de_Uso.docx`.

## Pruebas
```bash
cd backend  && npm test     # RUT y limpieza de texto
cd frontend && npm test     # sesión, validadores, fechas y mensajes de error
```

## Logo
`frontend/public/logo-vida-norte.svg` es el logo vectorial oficial. La aplicación lo dibuja en línea (`shared/logo.ts`) para usar Montserrat; en ese componente los tamaños de las dos primeras líneas se ajustaron para que el texto no se salga del dibujo.

## Fuera de este avance
Reservas de horas, formulario estandarizado de contacto, notificaciones por WhatsApp y correo, historial de accesos,
Clave Única simulada, registro de usuarios, edición y borrado de recomendaciones, límite de intentos de login
y cabeceras de seguridad (`helmet`).
