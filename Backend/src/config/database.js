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
    "Hostname",
    "Plataforma",
    "Marca/Modelo",
    "Tipo",
    "Firmware/Version S.O",
    "Ubicación",
    "Licenciamiento",
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
async function seedInformacionUsuario(cantidadPorUsuario = 25) {
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
          const marcas = [
            "Dell",
            "HP",
            "Lenovo",
            "Apple",
            "Samsung",
            "Asus",
            "Acer",
            "Microsoft",
          ];
          const tipos = [
            "Servidor",
            "Workstation",
            "Laptop",
            "Desktop",
            "Dispositivo móvil",
            "Tablet",
          ];
          const plataformas = [
            "Windows",
            "Linux",
            "macOS",
            "iOS",
            "Android",
            "Ubuntu",
            "CentOS",
          ];
          const versionesSO = [
            "Windows 11 Pro",
            "Windows 10 Enterprise",
            "Ubuntu 22.04 LTS",
            "macOS 14.0 Sonoma",
            "iOS 17.0",
            "Android 13",
            "CentOS 8",
            "Debian 12",
          ];
          // Generar fecha de licenciamiento en formato DD/MM/YYYY o DD-MM-YYYY
          // Algunas fechas serán pasadas (hasta 3 meses atrás) y otras futuras
          const hoy = new Date();
          const tresMesesAtras = new Date();
          tresMesesAtras.setMonth(hoy.getMonth() - 3);
          const cincoAnosFuturo = new Date();
          cincoAnosFuturo.setFullYear(hoy.getFullYear() + 5);

          // Generar fecha aleatoria entre 3 meses atrás y 5 años en el futuro
          const fechaLicencia = faker.date.between({
            from: tresMesesAtras,
            to: cincoAnosFuturo,
          });

          const dia = String(fechaLicencia.getDate()).padStart(2, "0");
          const mes = String(fechaLicencia.getMonth() + 1).padStart(2, "0");
          const año = fechaLicencia.getFullYear();
          const formato = faker.helpers.arrayElement(["/", "-"]);
          const fechaFormateada = `${dia}${formato}${mes}${formato}${año}`;

          const datos = {
            Hostname: `${faker.internet.domainWord()}-${faker.string
              .alphanumeric(4)
              .toUpperCase()}`,
            Plataforma: faker.helpers.arrayElement(plataformas),
            "Marca/Modelo": `${faker.helpers.arrayElement(
              marcas
            )} ${faker.string.alphanumeric(3).toUpperCase()}-${faker.number.int(
              { min: 1000, max: 9999 }
            )}`,
            Tipo: faker.helpers.arrayElement(tipos),
            "Firmware/Version S.O": faker.helpers.arrayElement(versionesSO),
            Ubicación: `${faker.location.city()}, ${faker.location.state()}`,
            Licenciamiento: fechaFormateada,
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
  db.run(`DROP TABLE IF EXISTS user_sessions`);

  // Crear tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      isAdmin BOOLEAN NOT NULL DEFAULT 0,
      verificado BOOLEAN NOT NULL DEFAULT 0
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
    INSERT OR IGNORE INTO datos_minimos (datos) VALUES ('["Hostname", "Plataforma", "Marca/Modelo", "Tipo", "Firmware/Version S.O", "Ubicación", "Licenciamiento"]')
  `);

  // Blacklist
  db.run(`
    CREATE TABLE IF NOT EXISTS token_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      expiresAt INTEGER NOT NULL
    )
  `);

  // Tabla de sesiones de usuario (soporte para múltiples sesiones)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      refresh_token TEXT NOT NULL UNIQUE,
      device_info TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      last_used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES usuario(id) ON DELETE CASCADE
    )
  `);

  // Índice para búsquedas rápidas por refresh_token
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token 
    ON user_sessions(refresh_token)
  `);

  // Índice para búsquedas por usuario
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
    ON user_sessions(user_id)
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
