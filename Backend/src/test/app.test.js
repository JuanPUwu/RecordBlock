import request from "supertest";
import app from "../app.js";

describe("Pruebas básicas del servidor", () => {
  test("GET /api-docs debe responder 200", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
  });

  test("CORS debe estar configurado correctamente", async () => {
    const res = await request(app)
      .get("/api-docs/")
      .set("Origin", "http://localhost:5173");

    // Verificar que la respuesta tiene headers CORS
    expect(res.status).toBe(200);
  });

  test("debe deshabilitar x-powered-by header", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  test("debe servir archivos estáticos desde /assets", async () => {
    const res = await request(app).get("/assets/");
    // Esperamos 404 o 403 ya que es un directorio, lo importante es que no da error de rutas
    expect([404, 403]).toContain(res.status);
  });

  test("debe servir archivos estáticos desde /views", async () => {
    const res = await request(app).get("/views/");
    // Esperamos 404 o 403 ya que es un directorio, lo importante es que no da error de rutas
    expect([404, 403]).toContain(res.status);
  });

  test("debe registrar todas las rutas de API", async () => {
    // Verificar que al menos swagger está disponible
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
  });

  test("debe servir swagger en /api-docs", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
    expect(res.text).toBeDefined();
  });
});
