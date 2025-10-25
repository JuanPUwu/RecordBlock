import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("database.db");

// ✅ Activar soporte para claves foráneas (IMPORTANTE en SQLite)
db.run("PRAGMA foreign_keys = ON");

// Crear tablas (reinicio)
db.serialize(async () => {
  // Borrar tablas relacionadas primero
  db.run(`DROP TABLE IF EXISTS tokens_verificacion`);
  db.run(`DROP TABLE IF EXISTS tokens_recuperacion`);
  db.run(`DROP TABLE IF EXISTS informacion_usuario`);
  db.run(`DROP TABLE IF EXISTS token_blacklist`);
  db.run(`DROP TABLE IF EXISTS usuario`);

  // Crear tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT NOT NULL,
      verificado BOOLEAN DEFAULT 0,
      refresh_token TEXT
    )
  `);

  // Tabla verificación con DELETE en cascada
  db.run(`
    CREATE TABLE IF NOT EXISTS tokens_verificacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token_hash TEXT,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES usuario(id) ON DELETE CASCADE
    )
  `);

  // Tabla recuperación con DELETE en cascada
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

  // Tabla información personal con DELETE en cascada
  db.run(`
    CREATE TABLE IF NOT EXISTS informacion_usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      datos TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
    )
  `);

  // Blacklist (no depende del usuario)
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
    `INSERT OR IGNORE INTO usuario (nombre, email, password, rol, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Administrador", "admin@example.com", hashedPassword, "admin", 1]
  );

  db.run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, rol, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Alpina", "alpina@example.com", hashedPassword, "cliente", 1]
  );

  db.run(
    `INSERT OR IGNORE INTO usuario (nombre, email, password, rol, verificado)
     VALUES (?, ?, ?, ?, ?)`,
    ["Compensar", "compensar@example.com", hashedPassword, "cliente", 1]
  );

  // Insertar información para Alpina y Compensar
  db.all(
    `SELECT id, nombre FROM usuario WHERE nombre IN ('Alpina', 'Compensar')`,
    async (err, users) => {
      if (err) {
        console.error("Error obteniendo usuarios:", err);
        return;
      }

      const infoEjemplos = [
        {
          Hostname: "ServidorPrincipal",
          Plataforma: "Windows Server",
          "Marca/Modelo": "Dell PowerEdge R740",
          Tipo: "Servidor",
          "Firmware/Versión S.O": "v2.4.1",
          Ubicación: "Bogotá - Centro de Datos",
          Licenciamiento: "Windows Server 2022 Standard",
        },
        {
          Hostname: "ServidorBackup01",
          Plataforma: "Linux Ubuntu Server",
          "Marca/Modelo": "HP ProLiant DL380 Gen10",
          Tipo: "Servidor de Respaldo",
          "Firmware/Versión S.O": "Ubuntu 20.04",
          Ubicación: "Medellín - DataCenter Secundario",
          Licenciamiento: "GNU/Linux Open Source",
        },
        {
          Hostname: "WebNode01",
          Plataforma: "Windows Server",
          "Marca/Modelo": "Dell PowerEdge T640",
          Tipo: "Servidor Web",
          "Firmware/Versión S.O": "Windows Server 2019",
          Ubicación: "Bogotá - Torre Central",
          Licenciamiento: "Windows Server 2019 Standard",
        },
        {
          Hostname: "DB-Cluster-01",
          Plataforma: "Red Hat Enterprise Linux",
          "Marca/Modelo": "Lenovo ThinkSystem SR650",
          Tipo: "Base de Datos",
          "Firmware/Versión S.O": "RHEL 8.6",
          Ubicación: "Cali - Planta de Datos",
          Licenciamiento: "RHEL Enterprise Subscription",
        },
        {
          Hostname: "Proxy01",
          Plataforma: "Linux Debian",
          "Marca/Modelo": "Cisco UCS C220",
          Tipo: "Proxy/Firewall",
          "Firmware/Versión S.O": "Debian 11",
          Ubicación: "Bogotá - Red Perimetral",
          Licenciamiento: "Software Libre",
        },
        {
          Hostname: "MailServer",
          Plataforma: "Windows Server",
          "Marca/Modelo": "Dell EMC R540",
          Tipo: "Correo Corporativo",
          "Firmware/Versión S.O": "Exchange Server 2019",
          Ubicación: "Bogotá - Edificio Norte",
          Licenciamiento: "Microsoft Exchange",
        },
        {
          Hostname: "VPN-Gateway",
          Plataforma: "Linux CentOS",
          "Marca/Modelo": "HP ProLiant DL360",
          Tipo: "VPN Empresarial",
          "Firmware/Versión S.O": "CentOS 7",
          Ubicación: "Medellín - Seguridad",
          Licenciamiento: "OpenVPN",
        },
        {
          Hostname: "StorageNAS01",
          Plataforma: "FreeNAS",
          "Marca/Modelo": "QNAP TS-1685",
          Tipo: "Almacenamiento NAS",
          "Firmware/Versión S.O": "FreeNAS 11.3",
          Ubicación: "Bogotá - Cuarto de Redes",
          Licenciamiento: "BSD Open Source",
        },
        {
          Hostname: "BackupCloud",
          Plataforma: "Linux Ubuntu",
          "Marca/Modelo": "Custom Server",
          Tipo: "Respaldo Nube",
          "Firmware/Versión S.O": "Ubuntu 22.04",
          Ubicación: "AWS - us-east-1",
          Licenciamiento: "AWS Subscription",
        },
        {
          Hostname: "DevOpsNode",
          Plataforma: "Linux Fedora",
          "Marca/Modelo": "Dell Precision",
          Tipo: "Automatización CI/CD",
          "Firmware/Versión S.O": "Fedora 35",
          Ubicación: "Bogotá - Área Desarrollo",
          Licenciamiento: "Software Libre",
        },
      ];

      users.forEach((user) => {
        infoEjemplos.forEach((info) => {
          db.run(
            `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
            [user.id, JSON.stringify(info)]
          );
        });
      });
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
