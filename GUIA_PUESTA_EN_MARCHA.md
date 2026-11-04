# Guía de puesta en marcha

Síntesis para dejar el sistema funcionando en un equipo nuevo: clonar, instalar, crear la base de datos, poner las credenciales, migrar y levantar. Tiempo estimado: 10 minutos.

## 1. Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Git | cualquiera reciente | clonar el repositorio |
| Node.js | 22 o superior (se probó con 26) | backend y frontend |
| MariaDB | 12 (versión con la que se probó) | base de datos |

El sistema usa los puertos **3000** (API), **4200** (interfaz) y **3306** (MariaDB).

## 2. Clonar

```bash
git clone https://github.com/dujuu/maurosalud.git
cd maurosalud/arm-seguimiento
```

## 3. Crear la base de datos (una sola vez)

Elige una clave para el usuario de la base de datos y reemplaza `<CLAVE_DB>`. Con MariaDB en ejecución:

```bash
# Linux
sudo mariadb
# Windows o macOS
mysql -u root -p
```

Dentro del cliente, pega:

```sql
CREATE DATABASE IF NOT EXISTS vida_norte CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'arm_app'@'localhost' IDENTIFIED BY '<CLAVE_DB>';
GRANT ALL PRIVILEGES ON vida_norte.* TO 'arm_app'@'localhost';
FLUSH PRIVILEGES;
```

Las tablas no se crean a mano: las crean las migraciones del paso 5.

## 4. Poner las credenciales

El archivo `.env` **no está en el repositorio** (contiene secretos). Se crea a partir de la plantilla:

```bash
cd backend
cp .env.example .env        # en Windows: copy .env.example .env
```

Edita `backend/.env`:

| Variable | Valor |
|---|---|
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |
| `DB_USER` | `arm_app` |
| `DB_PASS` | la misma `<CLAVE_DB>` del paso 3 |
| `DB_NAME` | `vida_norte` |
| `JWT_SECRET` | un texto largo y aleatorio (ver abajo) |
| `JWT_EXPIRES_IN` | `8h` |
| `PORT` | `3000` |

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 5. Backend: instalar, migrar y levantar

Desde `arm-seguimiento/backend`:

```bash
npm install
npm run migration:run     # crea las tablas usuarios, doctor_paciente y recomendaciones
npm run seed              # carga usuarios y recomendaciones de demostración (se puede repetir)
npm run start:dev         # API en http://localhost:3000/api
```

La documentación interactiva de la API (Swagger) queda en http://localhost:3000/api/docs.

## 6. Frontend: instalar y levantar

En otra terminal, desde `arm-seguimiento/frontend`:

```bash
npm install
npm start                 # interfaz en http://localhost:4200
```

Si el puerto 4200 está ocupado: `npm start -- --port 4201`.
La interfaz envía `/api` al backend por medio de `proxy.conf.json`, así que el backend debe estar levantado.

## 7. Entrar al sistema

Abre http://localhost:4200. En el modo de desarrollo, la pantalla de inicio de sesión tiene un panel «Cuentas de demostración» para entrar con un clic. La contraseña de todas las cuentas de demostración es `Vida2026`.

| Rol | Nombre | RUT |
|---|---|---|
| Doctor | Dr. Rodrigo Salas | 12.345.678-5 |
| Doctora | Dra. Paula Contreras | 14.567.890-0 |
| Paciente | Ana Muñoz | 16.789.012-1 |
| Paciente | Carlos Pérez | 18.234.567-9 |
| Paciente | Sofía Araya | 19.345.678-2 |

Son datos ficticios. La sesión se guarda por pestaña: se pueden abrir dos pestañas con usuarios distintos a la vez.

## 8. Comandos útiles

Desde `backend`:

| Comando | Qué hace |
|---|---|
| `npm run migration:show` | Muestra qué migraciones están aplicadas |
| `npm run migration:revert` | Deshace la última migración |
| `npm run seed:reset` | Deja los datos de demostración como nuevos |
| `npm test` | Pruebas unitarias del backend |
| `npm run docs` | Genera la documentación del código (TypeDoc) |

Desde `frontend`: `npm test` ejecuta las pruebas unitarias y `npm run build` genera la versión de producción.

## 9. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `ER_ACCESS_DENIED_ERROR` | `DB_USER` o `DB_PASS` del `.env` no coinciden con los del paso 3 |
| `Unknown database 'vida_norte'` | Falta crear la base de datos (paso 3) |
| `ECONNREFUSED 127.0.0.1:3306` | MariaDB no está en ejecución. En Linux: `sudo systemctl start mariadb` |
| `EADDRINUSE` en el puerto 3000 o 4200 | Otro programa usa el puerto. Cambia `PORT` en el `.env` o usa `npm start -- --port 4201` |
| El login muestra error de conexión | El backend no está levantado, o el frontend no se reinició después de cambiar el proxy |
| Un comando de `npm` falla por la versión | Usa Node.js 22 o superior (`node --version`) |

## 10. Qué no subir nunca

`backend/.env` y cualquier archivo con claves. El `.gitignore` del repositorio ya lo excluye; si necesitas compartir una configuración, comparte `.env.example`, que no tiene secretos.
