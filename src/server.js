require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const db = require("./db");
const respuestasRouter = require("./routes/respuestas");
const pdfRouter        = require("./routes/pdf");

const app = express();
const PORT = process.env.PORT || 3000;

// Token de sesión simple en memoria (se regenera al reiniciar el servidor)
let activeToken = null;

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "2mb" }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// ── POST /api/admin/login ── Valida credenciales y devuelve token ──────────
app.post("/api/admin/login", (req, res) => {
  const { user, pass } = req.body;
  if (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS
  ) {
    activeToken = crypto.randomBytes(32).toString("hex");
    return res.json({ ok: true, token: activeToken });
  }
  return res.status(401).json({ ok: false, error: "Credenciales incorrectas." });
});

// ── POST /api/admin/logout ── Invalida el token activo ────────────────────
app.post("/api/admin/logout", (req, res) => {
  activeToken = null;
  res.json({ ok: true });
});

// ── Middleware de autenticación admin ─────────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers["x-admin-token"];
  if (!auth || !activeToken || auth !== activeToken) {
    return res.status(401).json({ error: "No autorizado." });
  }
  next();
}

// ── GET /api/admin/respuestas ── Lista protegida para el panel ────────────
app.get("/api/admin/respuestas", requireAdmin, async (req, res) => {
  try {
    const { pool } = require("./db");
    const result = await pool.query(
      "SELECT * FROM respuestas ORDER BY fecha DESC LIMIT 500"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener respuestas (admin):", err.message);
    res.status(500).json({ error: "Error al obtener las respuestas." });
  }
});

// Rutas API públicas
app.use("/api/respuestas", respuestasRouter);
app.use("/api/pdf",        pdfRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Iniciar servidor
async function start() {
  try {
    await db.connect();
    console.log("✅ Conectado a PostgreSQL");
    await db.initSchema();
    console.log("✅ Esquema de base de datos listo");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err.message);
    process.exit(1);
  }
}

start();