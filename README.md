# Madurez Digital 2026 — Guía de instalación

## Estructura del proyecto

```
madurez-digital/
├── public/
│   └── index.html          ← El cuestionario (frontend)
├── src/
│   ├── server.js           ← Servidor Express principal
│   ├── db.js               ← Conexión y esquema PostgreSQL
│   └── routes/
│       └── respuestas.js   ← Endpoints de la API
├── .env.example            ← Plantilla de variables de entorno
├── nginx.conf              ← Configuración de Nginx
├── package.json
└── setup.sh                ← Script de instalación automática
```

---

## Opción A — Instalación automática (recomendada)

```bash
# 1. Sube todos los archivos al servidor (por ejemplo con scp)
scp -r madurez-digital/ usuario@IP_SERVIDOR:/tmp/

# 2. Conéctate al servidor
ssh usuario@IP_SERVIDOR

# 3. Ejecuta el script
cd /tmp/madurez-digital
chmod +x setup.sh
sudo bash setup.sh
```

El script instala Node.js 20, PostgreSQL, Nginx y PM2, crea la base de datos, copia los archivos y deja todo corriendo.

---

## Opción B — Instalación manual paso a paso

### 1. Instalar dependencias del sistema

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql
```

### 2. Crear la base de datos

```bash
sudo -u postgres psql

-- Dentro de psql:
CREATE DATABASE madurez_digital;
CREATE USER madurez_user WITH ENCRYPTED PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE madurez_digital TO madurez_user;
\c madurez_digital
GRANT ALL ON SCHEMA public TO madurez_user;
\q
```

### 3. Configurar la aplicación

```bash
# Copia los archivos
sudo mkdir -p /opt/madurez-digital /var/www/madurez-digital
sudo cp -r src package.json /opt/madurez-digital/
sudo cp public/index.html /var/www/madurez-digital/

# Crear el .env
sudo cp .env.example /opt/madurez-digital/.env
sudo nano /opt/madurez-digital/.env   # completa los valores
```

Contenido del `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=madurez_digital
DB_USER=madurez_user
DB_PASSWORD=tu_contraseña_segura
PORT=3000
CORS_ORIGIN=*
```

### 4. Instalar dependencias Node y arrancar

```bash
cd /opt/madurez-digital
sudo npm install --omit=dev

# Instalar PM2 para mantener el proceso vivo
sudo npm install -g pm2
pm2 start src/server.js --name madurez-digital
pm2 startup    # genera el comando para que arranque con el sistema
pm2 save
```

### 5. Configurar Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/madurez-digital
sudo ln -s /etc/nginx/sites-available/madurez-digital /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Edita el server_name con tu IP o dominio
sudo nano /etc/nginx/sites-available/madurez-digital

sudo nginx -t && sudo systemctl reload nginx
```

---

## Endpoints disponibles

| Método | Ruta                      | Descripción                              |
|--------|---------------------------|------------------------------------------|
| POST   | /api/respuestas           | Guarda una respuesta del cuestionario    |
| GET    | /api/respuestas           | Lista todas las respuestas (admin)       |
| GET    | /api/respuestas/promedios | Promedios globales por sección           |
| GET    | /api/health               | Verifica que el servidor está corriendo  |

### Ejemplo de POST /api/respuestas

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

## Comandos útiles

```bash
# Ver estado de la app
pm2 status

# Ver logs en tiempo real
pm2 logs madurez-digital

# Reiniciar la app
pm2 restart madurez-digital

# Ver respuestas en la BD
sudo -u postgres psql -d madurez_digital -c "SELECT id, respondente, empresa, fecha FROM respuestas;"
```
