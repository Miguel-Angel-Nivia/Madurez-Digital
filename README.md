# Diagnóstico de Madurez Digital 2026

---

## ¿Qué es este proyecto?

Herramienta web de autodiagnóstico de madurez digital. Permite a empresas evaluar su nivel de transformación digital en 7 dimensiones clave, obtener un puntaje de 0 a 100, ver su posición frente al mercado (LATAM, Norteamérica y Global), recibir recomendaciones priorizadas y descargar un reporte en PDF.

El proyecto está compuesto por un **frontend HTML estático** servido por Nginx y un **backend Node.js + Express** que recibe y persiste las respuestas en **PostgreSQL**, y genera PDFs con Puppeteer + Google Chrome.

---

## ¿Qué evalúa?

El cuestionario cubre **35 preguntas** distribuidas en 7 dimensiones:

| # | Dimensión | Qué mide |
|---|-----------|----------|
| 1 | Infraestructura y tecnología | Hardware, nube, seguridad, preparación para IA |
| 2 | Presencia digital y marketing | Canales, campañas, analítica, personalización |
| 3 | Operaciones y procesos internos | Automatización, datos en tiempo real, IA operativa |
| 4 | Experiencia del cliente | Canales de atención, CRM, autoservicio, visión 360 |
| 5 | Cultura digital y formación | Adopción, capacitación, alfabetización en IA |
| 6 | Estrategia y liderazgo digital | Visión, inversión, alineación negocio-tecnología |
| 7 | Integración y sistemas | ERP/CRM, interoperabilidad, gobierno del dato |

El resultado se clasifica en 4 niveles: **Etapa Inicial (0–24)**, **En Desarrollo (25–49)**, **En Camino (50–74)** y **Líder Digital (75–100)**.

---

## Stack tecnológico

- **Frontend:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- **Backend:** Node.js 20 + Express
- **Base de datos:** PostgreSQL (zona horaria: America/Bogota)
- **Generación de PDF:** Puppeteer Core + Google Chrome
- **Servidor web:** Nginx (proxy inverso con SSL)
- **Proceso manager:** PM2
- **Infraestructura:** Ubuntu 22.04 / 24.04 en Proxmox
- **SSL:** Let's Encrypt vía Certbot

---

## Cambios y mejoras recientes (frontend)

Los siguientes cambios fueron aplicados al `public/index.html` respecto a la versión inicial:

### Tipografía y tamaño de letra
- Tamaño base del body aumentado (~2pt más grande en toda la página)
- Todos los títulos, subtítulos, labels de sección y badges usan **Montserrat**
- El cuerpo de texto, campos e inputs usan **Calibri**
- Eliminadas las fuentes Syne y DM Sans

### Visual general
- Título principal del hero forzado a 2 líneas
- Etiquetas "Por qué importa" e "Información del respondente" en color naranja
- Mensaje de advertencia de preguntas obligatorias en amarillo con ícono SVG
- Textos de tags de capacitaciones con mejor contraste sobre fondo oscuro
- Etiquetas "En desacuerdo" / "De acuerdo" de la escala más grandes y visibles

### Iconos
- Todos los íconos emoji reemplazados por **SVGs simples color naranja** (contacto, pago, recomendaciones, diagnóstico)

### Campo de cargo
- Reemplazado de texto libre a **dropdown con 12 cargos** predefinidos del mercado

### Estadísticas comparativas por cargo (nuevo bloque en resultados)
- Aparece después de las recomendaciones y antes de las capacitaciones
- Muestra el promedio del cargo y el top 20% según benchmarks 2026
- Barras comparativas por dimensión: puntaje propio vs. promedio del cargo
- Basado en datos de mercado para los 12 cargos del dropdown

### Logo
- Logo de la empresa embebido como **Base64** directamente en el HTML (no depende de servidor externo)
- Aplicado `mix-blend-mode: screen` para que el fondo negro del PNG desaparezca sobre fondos oscuros

### Correo electrónico
- Reemplazados los correos ofuscados por Cloudflare por texto plano con enlace `mailto:`
- Para evitar que Cloudflare vuelva a ofuscarlos: **Scrape Shield → Email Address Obfuscation → OFF**

### Fondo animado (sección de preguntas)
- Canvas con partículas y conexiones azules estilo cielo estrellado
- Se activa con fade-in al llegar a la sección del formulario
- Se oculta automáticamente antes del footer
- Interactivo: el mouse repele suavemente las partículas

### Panel de resultados (admin)
- Botón **"Resultados"** en la cabecera, visible siempre
- Login con usuario y contraseña (ver sección de credenciales más abajo)
- Tabla con todos los diagnósticos: Nombre · Empresa · Cargo · Puntaje · Fecha · Botón PDF
- Buscador en tiempo real por nombre, empresa o cargo
- Botón de recarga de datos
- **La sesión se cierra automáticamente** al cerrar el panel — siempre pide login al reabrir

---

## Panel de resultados — Credenciales y seguridad

El panel de administración usa **autenticación del lado del servidor**. Las credenciales **no están en el HTML** — viven únicamente en el `.env` del servidor, por lo que no son visibles desde el inspector del navegador.

### Cómo funciona
1. El botón "Resultados" en la cabecera abre un modal de login
2. Al ingresar, el frontend llama a `POST /api/admin/login` con el usuario y contraseña
3. El backend valida contra `ADMIN_USER` y `ADMIN_PASS` del `.env` y devuelve un token aleatorio
4. Todas las peticiones al panel usan ese token en el header `x-admin-token`
5. Al cerrar el panel se llama a `POST /api/admin/logout` que invalida el token en el servidor

### Configurar o cambiar las credenciales

Edita el `.env` del servidor:

```bash
sudo nano /opt/madurez-digital/.env
```

Agrega o modifica estas líneas:

```env
ADMIN_USER=admin
ADMIN_PASS=TuNuevaContraseña
```

Luego reinicia:

```bash
pm2 restart madurez-digital
```

> **La contraseña actual del panel es la misma que la del servidor Robert-Prox.**  
> Si necesitas recordarla, consúltala ahí directamente.  
> **No escribas la contraseña en este archivo** — si el repo es público quedará expuesta.

---

## Estructura del proyecto

```
madurez-digital/
├── public/
│   └── index.html              ← Cuestionario completo (frontend)
├── src/
│   ├── server.js               ← Servidor Express principal
│   ├── db.js                   ← Conexión y esquema PostgreSQL
│   └── routes/
│       ├── respuestas.js       ← API REST: guardar, listar, promedios
│       └── pdf.js              ← Generación de PDF con Puppeteer
├── .env                        ← Variables de entorno (nunca subir a GitHub)
├── nginx.conf                  ← Configuración de Nginx
├── package.json
├── setup.sh                    ← Script de instalación automática
└── README.md
```

---

## Instalación desde GitHub (recomendado)

### Prerequisitos
- VM o LXC con Ubuntu 22.04 / 24.04 corriendo en Proxmox
- Acceso a internet desde la VM
- Usuario con permisos `sudo`

### Pasos

```bash
# 1. Clona el repositorio
cd /tmp
git clone https://github.com/tu-usuario/madurez-digital.git
cd madurez-digital

# 2. Configura las variables de entorno ANTES de correr el setup
cp .env.example .env
nano .env
```

Completa el `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=madurez_digital
DB_USER=madurez_user
DB_PASSWORD=TuContraseñaSegura2026
PORT=3000
CORS_ORIGIN=*
```

```bash
# 3. Ajusta el server_name en nginx.conf con tu IP o dominio
nano nginx.conf

# 4. Ejecuta el script de instalación
chmod +x setup.sh
sudo bash setup.sh
```

---

## Instalación manual paso a paso

### 1. Dependencias del sistema

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql
```

### 2. Google Chrome (requerido para generación de PDF)

```bash
wget -P /tmp https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y /tmp/google-chrome-stable_current_amd64.deb
google-chrome --version
```

### 3. Crear la base de datos

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE madurez_digital;
CREATE USER madurez_user WITH ENCRYPTED PASSWORD 'TuContraseñaSegura2026';
GRANT ALL PRIVILEGES ON DATABASE madurez_digital TO madurez_user;
\c madurez_digital
GRANT ALL ON SCHEMA public TO madurez_user;
ALTER DATABASE madurez_digital SET timezone TO 'America/Bogota';
\q
```

### 4. Copiar archivos y configurar entorno

```bash
sudo mkdir -p /opt/madurez-digital /var/www/madurez-digital
sudo cp -r src package.json /opt/madurez-digital/
sudo cp .env /opt/madurez-digital/.env
sudo cp public/index.html /var/www/madurez-digital/
```

### 5. Instalar dependencias Node y arrancar con PM2

```bash
cd /opt/madurez-digital
sudo npm install --omit=dev
sudo npm install puppeteer-core
sudo npm install -g pm2
pm2 start src/server.js --name madurez-digital --cwd /opt/madurez-digital
pm2 startup
pm2 save
```

### 6. Configurar Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/madurez-digital
sudo ln -s /etc/nginx/sites-available/madurez-digital /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 7. Certificado SSL con Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## Configuración de Nginx (con SSL)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name tu-dominio.com;

    ssl_certificate     /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    location /api/ {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering    off;
        proxy_read_timeout 120s;
    }

    location / {
        root   /var/www/madurez-digital;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

> **Importante:** `proxy_buffering off` y `proxy_read_timeout 120s` son necesarios para que la generación del PDF no se interrumpa.

> **Cloudflare:** Si usas Cloudflare como proxy, desactiva **Scrape Shield → Email Address Obfuscation** para que los correos del frontend se muestren correctamente.

---

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/respuestas` | Guarda una respuesta completa del cuestionario |
| `GET`  | `/api/respuestas` | Lista todas las respuestas (público) |
| `GET`  | `/api/respuestas/promedios` | Promedios globales por sección |
| `POST` | `/api/pdf` | Genera y descarga el reporte PDF de resultados |
| `GET`  | `/api/health` | Verifica que el servidor está activo |
| `POST` | `/api/admin/login` | Valida credenciales y devuelve token de sesión |
| `POST` | `/api/admin/logout` | Invalida el token activo |
| `GET`  | `/api/admin/respuestas` | Lista todos los registros — requiere token admin |

### Ejemplo de payload — POST /api/respuestas

```json
{
  "respondente": "Juan Pérez",
  "empresa": "Acme S.A.",
  "cargo": "Gerente TI",
  "answers": {
    "infra_0": 4, "infra_1": 3, "infra_2": 5, "infra_3": 2, "infra_4": 4,
    "mkt_0": 3,   "mkt_1": 4,   "mkt_2": 3,   "mkt_3": 2,   "mkt_4": 3,
    "ops_0": 4,   "ops_1": 5,   "ops_2": 4,   "ops_3": 3,   "ops_4": 4,
    "cx_0": 5,    "cx_1": 4,    "cx_2": 3,    "cx_3": 2,    "cx_4": 3,
    "cult_0": 4,  "cult_1": 3,  "cult_2": 5,  "cult_3": 3,  "cult_4": 4,
    "strat_0": 3, "strat_1": 4, "strat_2": 3, "strat_3": 2, "strat_4": 3,
    "int_0": 4,   "int_1": 3,   "int_2": 4,   "int_3": 2,   "int_4": 3
  }
}
```

---

## Comandos útiles post-instalación

```bash
# Ver estado de la app
pm2 status

# Ver logs en tiempo real
pm2 logs madurez-digital

# Reiniciar la app tras cambios en el backend
pm2 restart madurez-digital

# Actualizar solo el frontend (sin reiniciar el backend)
sudo cp index.html /var/www/madurez-digital/index.html

# Limpiar logs acumulados
pm2 flush madurez-digital

# Consultar respuestas guardadas
sudo -u postgres psql -d madurez_digital \
  -c "SELECT id, respondente, empresa, cargo, fecha FROM respuestas ORDER BY fecha DESC LIMIT 20;"

# Filtrar respuestas por empresa
sudo -u postgres psql -d madurez_digital \
  -c "SELECT id, respondente, cargo, fecha FROM respuestas WHERE empresa ILIKE 'nombre_empresa' ORDER BY fecha DESC;"

# Ver promedios globales por sección
curl http://localhost:3000/api/respuestas/promedios

# Verificar que el servidor responde
curl http://localhost:3000/api/health

# Eliminar registros de prueba (conservar los primeros N)
sudo -u postgres psql -d madurez_digital \
  -c "DELETE FROM respuestas WHERE id NOT IN (SELECT id FROM respuestas ORDER BY id ASC LIMIT 2);"
```

---

## Notas importantes

- El archivo `.env` **nunca debe subirse a GitHub** — está excluido en `.gitignore`.
- Si el backend no está disponible al enviar el formulario, **los resultados igual se muestran** en pantalla. El error queda solo en consola.
- La tabla `respuestas` se crea automáticamente al arrancar el servidor si no existe.
- PM2 reinicia la app automáticamente si el proceso cae o si el servidor se reinicia.
- La zona horaria de la base de datos está configurada en `America/Bogota`.
- El PDF se genera con `puppeteer-core` apuntando a Google Chrome instalado en `/usr/bin/google-chrome`. Si Chrome cambia de ruta, actualizar `executablePath` en `src/routes/pdf.js`.
- `proxy_buffering off` en Nginx es obligatorio para que el PDF se descargue correctamente.
- El logo está embebido como Base64 en el HTML — si cambia el logo, reemplazar la cadena Base64 directamente en `index.html`.
- Las credenciales del panel admin viven **solo en el `.env`** del servidor — no están en el HTML ni son visibles desde el navegador.
- El token de sesión del panel es aleatorio y se genera en memoria — se invalida automáticamente si el servidor se reinicia o el usuario cierra el panel.
