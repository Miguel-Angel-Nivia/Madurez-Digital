# Diagnóstico de Madurez Digital 2026
### Servicios y Soluciones IP

---

## ¿Qué es este proyecto?

Esta es una herramienta web de autodiagnóstico de madurez digital desarrollada para **Servicios y Soluciones IP**. Permite a empresas evaluar su nivel de transformación digital en 7 dimensiones clave, obtener un puntaje de 0 a 100, ver su posición frente al mercado (LATAM, Norteamérica y Global), y recibir recomendaciones priorizadas junto con una oferta de capacitación en IA.

El proyecto está compuesto por un **frontend HTML estático** servido por Nginx y un **backend Node.js + Express** que recibe y persiste las respuestas en **PostgreSQL**.

---

## Propósito

- Generar leads calificados a partir de empresas que completan el diagnóstico
- Identificar el nivel de madurez digital de clientes potenciales antes de una conversación comercial
- Posicionar a Servicios y Soluciones IP como referente en transformación digital e IA en LATAM
- Ofrecer automáticamente los programas de capacitación más relevantes según el resultado del usuario

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
- **Base de datos:** PostgreSQL
- **Servidor web:** Nginx (proxy inverso)
- **Proceso manager:** PM2
- **Infraestructura:** Ubuntu 22.04 / 24.04 en Proxmox

---

## Estructura del proyecto

```
madurez-digital/
├── public/
│   └── index.html          ← Cuestionario completo (frontend)
├── src/
│   ├── server.js           ← Servidor Express principal
│   ├── db.js               ← Conexión y esquema PostgreSQL
│   └── routes/
│       └── respuestas.js   ← API REST: guardar, listar, promedios
├── .env.example            ← Plantilla de variables de entorno
├── .gitignore              ← Excluye .env y node_modules
├── nginx.conf              ← Configuración de Nginx
├── package.json
├── setup.sh                ← Script de instalación automática
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
# Cambia: server_name tu-dominio.com;
# Por:    server_name 206.165.108.17;

# 4. Ejecuta el script de instalación
chmod +x setup.sh
sudo bash setup.sh
```

El script instala automáticamente Node.js 20, PostgreSQL, Nginx y PM2, crea la base de datos y el usuario, copia los archivos a sus rutas definitivas y deja todo corriendo como servicio.

Al finalizar verás:
```
✅ Conectado a PostgreSQL
✅ Esquema de base de datos listo
🚀 Servidor corriendo en http://localhost:3000
```

El cuestionario queda disponible en `http://TU_IP`.

---

## Instalación manual paso a paso

### 1. Instalar dependencias del sistema

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql
```

### 2. Crear la base de datos

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE madurez_digital;
CREATE USER madurez_user WITH ENCRYPTED PASSWORD 'TuContraseñaSegura2026';
GRANT ALL PRIVILEGES ON DATABASE madurez_digital TO madurez_user;
\c madurez_digital
GRANT ALL ON SCHEMA public TO madurez_user;
\q
```

### 3. Copiar archivos y configurar entorno

```bash
sudo mkdir -p /opt/madurez-digital /var/www/madurez-digital
sudo cp -r src package.json /opt/madurez-digital/
sudo cp .env /opt/madurez-digital/.env
sudo cp public/index.html /var/www/madurez-digital/
```

### 4. Instalar dependencias y arrancar con PM2

```bash
cd /opt/madurez-digital
sudo npm install --omit=dev
sudo npm install -g pm2
pm2 start src/server.js --name madurez-digital
pm2 startup
pm2 save
```

### 5. Configurar Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/madurez-digital
sudo ln -s /etc/nginx/sites-available/madurez-digital /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/respuestas` | Guarda una respuesta completa del cuestionario |
| `GET`  | `/api/respuestas` | Lista todas las respuestas (uso interno/admin) |
| `GET`  | `/api/respuestas/promedios` | Promedios globales por sección |
| `GET`  | `/api/health` | Verifica que el servidor está activo |

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

# Reiniciar la app (tras cambios)
pm2 restart madurez-digital

# Consultar respuestas guardadas
sudo -u postgres psql -d madurez_digital \
  -c "SELECT id, respondente, empresa, cargo, fecha FROM respuestas ORDER BY fecha DESC LIMIT 20;"

# Ver promedios por sección
curl http://localhost:3000/api/respuestas/promedios

# Verificar que el servidor responde
curl http://localhost:3000/api/health
```

---

## Notas importantes

- El archivo `.env` **nunca debe subirse a GitHub** — está excluido en `.gitignore`.
- Si el backend no está disponible cuando un usuario envía el formulario, **los resultados igual se muestran** en pantalla. El error queda solo en consola para no afectar la experiencia del usuario.
- La tabla `respuestas` se crea automáticamente al arrancar el servidor si no existe.
- PM2 reinicia la app automáticamente si el proceso cae o si el servidor se reinicia.

---

## Contacto

**Servicios y Soluciones IP**
- Correo: comercialsys@serviciosysolucionesip.com
- WhatsApp: +57 314 790 8645
- Web: [serviciosysolucionesip.com](https://serviciosysolucionesip.com)
