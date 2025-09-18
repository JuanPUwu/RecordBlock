// preload.js
import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  // Puedes agregar funciones aquí para comunicar el frontend con Electron si es necesario
});
