import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const db = new sqlite3.Database("database.db");

// Activar soporte para claves foráneas
await run("PRAGMA foreign_keys = ON");

// Wrappers de Promises
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

// Obtener la lista de datos_minimos para usar como iniciales en informacion_usuario
async function obtenerDatosMinimosIniciales() {
  const fallback = [
    "direccion",
    "ciudad",
    "pais",
    "telefono",
    "nacimiento",
    "bio",
  ];

  try {
    const filas = await all("SELECT datos FROM datos_minimos LIMIT 1");
    const fila = filas?.[0];
    if (!fila?.datos) {
      return JSON.stringify(fallback);
    }

    const lista = JSON.parse(fila.datos);
    // Siempre devolvemos un string JSON válido
    return JSON.stringify(Array.isArray(lista) ? lista : fallback);
  } catch {
    // Si algo falla, usamos el fallback por defecto
    return JSON.stringify(fallback);
  }
}

// Poblar informacion_usuario con datos de ejemplo
async function seedInformacionUsuario(cantidadPorUsuario = 10) {
  try {
    const usuarios = await all("SELECT id FROM usuario WHERE isAdmin = 0");
    const datosMinimosIniciales = await obtenerDatosMinimosIniciales();

    await Promise.all(
      usuarios.map(async (usuario) => {
        const [conteo] = await all(
          "SELECT COUNT(*) as total FROM informacion_usuario WHERE usuario_id = ?",
          [usuario.id]
        );

        const existentes = conteo?.total ?? 0;

        // Si ya tiene la cantidad deseada o más, no hacemos nada
        if (existentes >= cantidadPorUsuario) return;

        for (let i = existentes; i < cantidadPorUsuario; i++) {
          const datos = {
            direccion: faker.location.streetAddress(),
            ciudad: faker.location.city(),
            pais: faker.location.country(),
            telefono: faker.phone.number(),
            nacimiento: faker.date
              .birthdate({ min: 18, max: 65, mode: "age" })
              .toISOString()
              .split("T")[0],
            bio: faker.lorem.sentence(),
          };

          await run(
            `
            INSERT INTO informacion_usuario (usuario_id, datos, datos_minimos)
            VALUES (?, ?, ?)
          `,
            [usuario.id, JSON.stringify(datos), datosMinimosIniciales]
          );
        }
      })
    );
  } catch (error) {
    console.error("Error poblando informacion_usuario:", error);
  }
}

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
      datos_minimos TEXT NOT NULL,
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
    INSERT OR IGNORE INTO datos_minimos (datos) VALUES ('["direccion", "ciudad", "pais", "telefono", "nacimiento", "bio"]')
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

  await run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Administrador", "admin@example.com", hashedPassword, 1, 1]
  );

  await run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Microsoft", "microsoft@example.com", hashedPassword, 0, 1]
  );

  await run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Apple", "apple@example.com", hashedPassword, 0, 1]
  );

  await run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Google", "google@example.com", hashedPassword, 0, 1]
  );

  await run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, isAdmin, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Pablo", "pablys8@gmail.com", hashedPassword, 0, 1]
  );

  await seedInformacionUsuario();
});

export default db;
