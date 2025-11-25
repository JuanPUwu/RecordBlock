// src/utils/dbHelpers.js
import db from "../config/database.js";

// Ejecutar consultas de escritura (INSERT, UPDATE, DELETE)
export const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // devuelve información de la operación
    });
  });

// Ejecutar una consulta que devuelve un único registro
export const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

// Ejecutar una consulta que devuelve múltiples registros
export const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
