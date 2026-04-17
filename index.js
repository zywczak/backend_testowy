const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Twoje DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// tworzenie tabeli (jeśli nie istnieje)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS requests_log (
      id SERIAL PRIMARY KEY,
      ip TEXT,
      host TEXT,
      origin TEXT,
      referer TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
initDB();

// endpoint
app.get("/", async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const host = req.headers.host;
    const origin = req.headers.origin || null;
    const referer = req.headers.referer || null;
    const userAgent = req.headers["user-agent"];

    await pool.query(
      `INSERT INTO requests_log (ip, host, origin, referer, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [ip, host, origin, referer, userAgent]
    );

    res.json({
      message: "Zapisano",
      ip,
      host,
      origin,
      referer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Błąd serwera");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server działa na porcie", PORT);
});