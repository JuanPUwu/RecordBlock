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
      refresh_token TEXT
    )
  `);

  // Crear tabla de informacion_usuario
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

  // Insertar usuarios por defecto
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("Contraseña123@", saltRounds);

  // Usuario admin
  db.run(
    `INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
    ["Juan Pérez", "juan@example.com", hashedPassword, "admin"],
    function (err) {
      if (err) {
        console.error("Error al crear usuario admin:", err.message);
      } else {
        console.log("Usuario admin creado: juan@example.com (Contraseña123@)");
      }
    }
  );

  // Usuario cliente 1: María
  db.run(
    `INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
    ["María López", "maria@example.com", hashedPassword, "cliente"],
    function (err) {
      if (err) {
        console.error("Error al crear usuario cliente:", err.message);
      } else {
        const usuarioId = this.lastID;
        console.log("Usuario cliente creado: maria@example.com (Contraseña123@)");

        // Insertar 4 registros de información para María
        db.run(
          `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
          [
            usuarioId,
            JSON.stringify({
              Hostname: "FAD-LVLT-01M__CO",
              "Fisico/Virtual": "Fisico",
              Plataforma: "Balanceador",
              Servicio: "Balanceo de portales Web y servicio de correo",
              "Marca/Modelo": "Forti ADC 1000F",
              Tipo: "Cluster",
              Estado: "HA Master",
              Serial: "FAD1KFT619000120",
              "Firmware/Version S.O": "FortiADC v6.2.3, build0428",
              IP_URL_Mgnt: "192.168.100.10",
              IP_Adicionales: "10.0.10.5, 10.0.10.6",
              Ubicación: "Datacenter - Sala3, Rack 031.025, Unidades 9-8",
            }),
          ]
        );
        db.run(
          `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
          [
            usuarioId,
            JSON.stringify({
              Hostname: "FAD-LVLT-01S__CO",
              "Fisico/Virtual": "Fisico",
              Plataforma: "Balanceador",
              Servicio: "Balanceo de portales Web y servicio de correo",
              "Marca/Modelo": "Forti ADC 1000F",
              Tipo: "Cluster",
              Estado: "HA Slave",
              Serial: "FAD1KFT619000121",
              "Firmware/Version S.O": "FortiADC v6.2.3, build0428",
              IP_URL_Mgnt: "192.168.100.11",
              IP_Adicionales: "10.0.10.7, 10.0.10.8",
              Ubicación: "Datacenter - Sala3, Rack 031.025, Unidades 7-6",
            }),
          ]
        );
        db.run(
          `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
          [
            usuarioId,
            JSON.stringify({
              Hostname: "SRV-APP-01__CO",
              "Fisico/Virtual": "Virtual",
              Plataforma: "Servidor de Aplicaciones",
              Servicio: "Aplicaciones internas de la compañía",
              "Marca/Modelo": "VMware ESXi VM",
              Tipo: "Standalone",
              Estado: "Activo",
              Serial: "VMX20250903001",
              "Firmware/Version S.O": "Ubuntu Server 22.04 LTS",
              IP_URL_Mgnt: "192.168.200.20",
              IP_Adicionales: "10.0.20.15, 10.0.20.16",
              Ubicación: "Datacenter - Sala2, Rack 020.010, Unidad 5",
            }),
          ]
        );
        db.run(
          `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
          [
            usuarioId,
            JSON.stringify({
              Hostname: "DB-SQL-01__CO",
              "Fisico/Virtual": "Fisico",
              Plataforma: "Base de Datos",
              Servicio: "SQL Server para gestión de clientes",
              "Marca/Modelo": "Dell PowerEdge R740",
              Tipo: "Standalone",
              Estado: "Producción",
              Serial: "SN12345SQL001",
              "Firmware/Version S.O": "Windows Server 2019 Datacenter",
              IP_URL_Mgnt: "192.168.200.30",
              IP_Adicionales: "10.0.30.10, 10.0.30.11",
              Ubicación: "Datacenter - Sala1, Rack 010.005, Unidad 12",
            }),
          ]
        );
      }
    }
  );

  // Usuario cliente 2: Pedro
  db.run(
    `INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
    ["Pedro Gómez", "pedro@example.com", hashedPassword, "cliente"],
    function (err) {
      if (err) {
        console.error("Error al crear usuario cliente:", err.message);
      } else {
        const usuarioId = this.lastID;
        console.log("Usuario cliente creado: pedro@example.com (Contraseña123@)");

        // Insertar 4 registros de información para Pedro
        db.run(
          `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
          [
            usuarioId,
            JSON.stringify({
              Hostname: "WEB-PORTAL-01__CO",
              "Fisico/Virtual": "Virtual",
              Plataforma: "Servidor Web",
              Servicio: "Portal institucional",
              "Marca/Modelo": "VMware ESXi VM",
              Tipo: "Standalone",
              Estado: "Activo",
              Serial: "VMX20250903010",
              "Firmware/Version S.O": "CentOS 8",
              IP_URL_Mgnt: "192.168.210.40",
              IP_Adicionales: "10.0.40.20, 10.0.40.21",
              Ubicación: "Datacenter - Sala2, Rack 022.012, Unidad 4",
            }),
          ]
        );
        db.run(
          `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
          [
            usuarioId,
            JSON.stringify({
              Hostname: "MAIL-SRV-01__CO",
              "Fisico/Virtual": "Fisico",
              Plataforma: "Servidor de Correo",
              Servicio: "Correo corporativo",
              "Marca/Modelo": "HP ProLiant DL380 Gen10",
              Tipo: "Standalone",
              Estado: "Producción",
              Serial: "HPMX20250903011",
              "Firmware/Version S.O": "Windows Server 2022",
              IP_URL_Mgnt: "192.168.210.41",
              IP_Adicionales: "10.0.41.10, 10.0.41.11",
              Ubicación: "Datacenter - Sala1, Rack 015.020, Unidad 7",
            }),
          ]
        );
        db.run(
          `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
          [
            usuarioId,
            JSON.stringify({
              Hostname: "BK-SRV-01__CO",
              "Fisico/Virtual": "Fisico",
              Plataforma: "Servidor de Backups",
              Servicio: "Respaldo de datos críticos",
              "Marca/Modelo": "Lenovo ThinkSystem SR650",
              Tipo: "Standalone",
              Estado: "Activo",
              Serial: "LEN20250903012",
              "Firmware/Version S.O": "Debian 11",
              IP_URL_Mgnt: "192.168.210.42",
              IP_Adicionales: "10.0.42.15, 10.0.42.16",
              Ubicación: "Datacenter - Sala3, Rack 030.018, Unidad 9",
            }),
          ]
        );
        db.run(
          `INSERT INTO informacion_usuario (usuario_id, datos) VALUES (?, ?)`,
          [
            usuarioId,
            JSON.stringify({
              Hostname: "FW-EDGE-01__CO",
              "Fisico/Virtual": "Fisico",
              Plataforma: "Firewall",
              Servicio: "Protección de borde de red",
              "Marca/Modelo": "FortiGate 200E",
              Tipo: "Standalone",
              Estado: "Activo",
              Serial: "FGT20250903013",
              "Firmware/Version S.O": "FortiOS v7.0.5, build0366",
              IP_URL_Mgnt: "192.168.210.43",
              IP_Adicionales: "10.0.43.5, 10.0.43.6",
              Ubicación: "Datacenter - Sala3, Rack 033.014, Unidad 2",
            }),
          ]
        );
      }
    }
  );
});

// Wrappers para Promises
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

// Export default para compatibilidad
export default db;
