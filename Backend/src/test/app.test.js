import request from "supertest";
import app from "../app.js";

describe("Pruebas básicas del servidor", () => {
  test("GET /api-docs debe responder 200", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
  });
});
