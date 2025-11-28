import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("database.db");

// Activar soporte para claves foráneas (IMPORTANTE en SQLite)
db.run("PRAGMA foreign_keys = ON");

// Crear tablas
db.serialize(async () => {
  // Borrar tablas relacionadas primero
  db.run(`DROP TABLE IF EXISTS usuario`);
  db.run(`DROP TABLE IF EXISTS tokens_verificacion`);
  db.run(`DROP TABLE IF EXISTS tokens_recuperacion`);
  db.run(`DROP TABLE IF EXISTS informacion_usuario`);
  db.run(`DROP TABLE IF EXISTS datos_minimos`);
  db.run(`DROP TABLE IF EXISTS token_blacklist`);

  // Crear tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      isAdmin BOOLEAN NOT NULL DEFAULT 0,
      verificado BOOLEAN NOT NULL DEFAULT 0,
      refresh_token TEXT
    )
  `);

  // Tabla verificación
  db.run(`
    CREATE TABLE IF NOT EXISTS tokens_verificacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token_hash TEXT,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES usuario(id) ON DELETE CASCADE
    )
  `);

  // Tabla recuperación
  db.run(`
    CREATE TABLE IF NOT EXISTS tokens_recuperacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES usuario(id) ON DELETE CASCADE
    )
  `);

  // Tabla información usuario
  db.run(`
    CREATE TABLE IF NOT EXISTS informacion_usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      datos TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS datos_minimos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datos TEXT NOT NULL
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO datos_minimos (datos) VALUES ('[]')
  `);

  // Blacklist
  db.run(`
    CREATE TABLE IF NOT EXISTS token_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      expiresAt INTEGER NOT NULL
    )
  `);

  // Insertar usuarios por defecto
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("Contraseña123@", saltRounds);

  db.run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Administrador", "admin@example.com", hashedPassword, 1, 1]
  );

  db.run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Microsoft", "microsoft@example.com", hashedPassword, 0, 1]
  );

  db.run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Apple", "apple@example.com", hashedPassword, 0, 1]
  );

  db.run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Google", "google@example.com", hashedPassword, 0, 1]
  );

  db.run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Pablo", "pablys8@gmail.com", hashedPassword, 0, 1]
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
