import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("database.db");

// Crear tablas (reinicio)
db.serialize(async () => {
  // Borrar tablas si existen
  db.run("DROP TABLE IF EXISTS informacion_usuario");
  db.run("DROP TABLE IF EXISTS usuario");
  db.run("DROP TABLE IF EXISTS token_blacklist");

  // Crear tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT NOT NULL,
      verificado BOOLEAN default 0,
      refresh_token TEXT
    )
  `);

  // Crear tabla de verificación de cuenta
  db.run(`
    CREATE TABLE IF NOT EXISTS tokens_verificacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token_hash TEXT,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES usuario(id)
    )
  `);

  // Crear tabla de información de usuario
  db.run(`
    CREATE TABLE IF NOT EXISTS informacion_usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      datos TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuario(id)
    )
  `);

  // Crear tabla de blacklist de tokens
  db.run(`
    CREATE TABLE IF NOT EXISTS token_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      expiresAt INTEGER NOT NULL
    )
  `);

  // Insertar usuario por defecto
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("Contraseña123@", saltRounds);

  db.run(
    `INSERT INTO usuario (nombre, email, password, rol, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Juan Pérez", "juan@example.com", hashedPassword, "admin", 1],
    function (err) {
      if (err) {
        console.error("Error al crear usuario admin:", err.message);
      } else {
        console.log("Usuario admin creado: juan@example.com (Contraseña123@)");
      }
    }
  );
});

// ✅ Wrappers para Promises
export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export default db;
