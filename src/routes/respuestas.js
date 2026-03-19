const express = require("express");
const router = express.Router();
const { pool } = require("../db");

const SECCIONES = ["infra", "mkt", "ops", "cx", "cult", "strat", "int"];
const PREGUNTAS_POR_SECCION = 5;

// POST /api/respuestas — Guarda una respuesta completa
router.post("/", async (req, res) => {
  const { respondente, empresa, cargo, answers } = req.body;

  // Validar que vengan todas las respuestas
  const totalEsperado = SECCIONES.length * PREGUNTAS_POR_SECCION;
  const totalRecibido = Object.keys(answers || {}).length;

  if (totalRecibido < totalEsperado) {
    return res.status(400).json({
      error: `Faltan respuestas. Se esperaban ${totalEsperado}, se recibieron ${totalRecibido}.`,
    });
  }

  // Construir columnas y valores dinámicamente
  const columnas = [];
  const valores = [];
  const placeholders = [];
  let idx = 1;

  // Campos de identificación (opcionales)
  if (respondente !== undefined) { columnas.push("respondente"); valores.push(respondente); placeholders.push(`$${idx++}`); }
  if (empresa     !== undefined) { columnas.push("empresa");     valores.push(empresa);     placeholders.push(`$${idx++}`); }
  if (cargo       !== undefined) { columnas.push("cargo");       valores.push(cargo);       placeholders.push(`$${idx++}`); }

  // Respuestas del cuestionario
  for (const sec of SECCIONES) {
    for (let i = 0; i < PREGUNTAS_POR_SECCION; i++) {
      const key = `${sec}_${i}`;
      const val = answers[key];
      if (val === undefined || val < 1 || val > 5) {
        return res.status(400).json({ error: `Respuesta inválida para la pregunta ${key}.` });
      }
      columnas.push(key);
      valores.push(val);
      placeholders.push(`$${idx++}`);
    }
  }

  const query = `
    INSERT INTO respuestas (${columnas.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING id, fecha
  `;

  try {
    const result = await pool.query(query, valores);
    const { id, fecha } = result.rows[0];

    // Calcular puntajes por sección para devolver al frontend
    const puntajes = {};
    for (const sec of SECCIONES) {
      let total = 0;
      for (let i = 0; i < PREGUNTAS_POR_SECCION; i++) {
        total += answers[`${sec}_${i}`];
      }
      puntajes[sec] = { total, maximo: PREGUNTAS_POR_SECCION * 5 };
    }

    res.status(201).json({ id, fecha, puntajes });
  } catch (err) {
    console.error("Error al guardar respuesta:", err.message);
    res.status(500).json({ error: "Error interno al guardar la respuesta." });
  }
});

// GET /api/respuestas — Lista todas las respuestas (para panel admin)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM respuestas ORDER BY fecha DESC LIMIT 500"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener respuestas:", err.message);
    res.status(500).json({ error: "Error al obtener las respuestas." });
  }
});

// GET /api/respuestas/promedios — Promedios globales por sección
router.get("/promedios", async (req, res) => {
  const columnasProm = [];
  for (const sec of SECCIONES) {
    for (let i = 0; i < PREGUNTAS_POR_SECCION; i++) {
      columnasProm.push(`ROUND(AVG(${sec}_${i}), 2) AS prom_${sec}_${i}`);
    }
  }

  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS total_respuestas, ${columnasProm.join(", ")}
      FROM respuestas
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al calcular promedios:", err.message);
    res.status(500).json({ error: "Error al calcular promedios." });
  }
});

module.exports = router;
