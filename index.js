const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 poprawne IP (ważne na Render)
app.set("trust proxy", true);

// DATABASE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 🔧 DB INIT
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
    );

    ALTER TABLE requests_log ADD COLUMN ip_chain TEXT;
  `);
  
}

initDB();

// ======================
// 📌 ENDPOINT
// ======================
app.post("/", async (req, res) => {
  try {
    // 🔥 IP SAFE
    const ipRaw = req.headers["x-forwarded-for"];
    const ip =
      (typeof ipRaw === "string" ? ipRaw.split(",")[0] : null) ||
      req.ip ||
      req.socket.remoteAddress;

    const ipChain = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // 🌐 headers
    const host = req.headers.host || null;
   const origin =
  req.headers["x-client-origin"] ||
  req.headers.origin ||
  req.headers.referer ||
  null;
    const referer = req.headers.referer || null;
    const userAgent = req.headers["user-agent"] || null;

    // 💾 INSERT (POPRAWIONE — bez ip_chain bo nie masz kolumny)
    await pool.query(
      `INSERT INTO requests_log (ip, ip_chain, host, origin, referer, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ip, ipChain, host, origin, referer, userAgent]
    );

    res.json({
      message: "Zapisano",
      ip,
      host,
      origin,
      referer,
    });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Błąd serwera");
  }
});

// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server działa na porcie", PORT);
});