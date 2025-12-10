import { useRef } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";
import { parsearCSV, generarTablaCSV } from "../utils/csvUtils.js";
import swalStyles from "../css/swalStyles.js";
import swalStylesCSV from "../css/swalStylesCSV.js";
import swalStylesConfirmCSV from "../css/swalStylesConfirmCSV.js";

export const useCSV = (clienteSeleccionado, cargarInformacion) => {
  const refInputFile = useRef(null);
  const { subirCSV } = useInfoUsuarioService();

  const manejarSubidaCSV = () => {
    // Validar que haya un cliente seleccionado
    if (!clienteSeleccionado) {
      toast.error("Debes seleccionar un cliente primero");
      return;
    }

    // Abrir el selector de archivos
    refInputFile.current?.click();
  };

  // Función que se ejecuta cuando se selecciona un archivo
  const onFileSelected = async (event, setIsLoading) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea un archivo CSV
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Por favor selecciona un archivo CSV");
      event.target.value = ""; // Limpiar el input
      return;
    }

    // Leer el archivo
    try {
      const texto = await file.text();
      const { headers, filas } = parsearCSV(texto);

      if (filas.length === 0) {
        toast.error("El archivo CSV está vacío o no tiene filas de datos");
        event.target.value = ""; // Limpiar el input
        return;
      }

      // Generar tabla HTML
      const tablaHTML = generarTablaCSV(headers, filas);

      // Paso 1: Mostrar tabla con las filas
      const resultadoVista = await Swal.fire({
        title: `Vista previa importación`,
        html: tablaHTML,
        icon: false,
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        width: "40rem",
        ...swalStylesCSV,
      });

      if (!resultadoVista.isConfirmed) {
        event.target.value = ""; // Limpiar el input
        return;
      }

      // Paso 2: Mostrar confirmación
      const result = await Swal.fire({
        title:
          "¿Estás seguro que quieres importar el archivo CSV seleccionado?",
        html: `
          <div class="confirmacion-csv">
            <p><strong>⚠️ Esta acción es irreversible</strong></p>
            <p>Se intentarán insertar <strong>${filas.length} fila(s)</strong> de registros.</p>
            <p>¿Deseas continuar con la importación?</p>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, Importar archivo",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        ...swalStylesConfirmCSV,
      });

      if (result.isConfirmed) {
        // Crear FormData y subir el archivo
        const formData = new FormData();
        formData.append("archivo", file);
        // Agregar el usuario_id si el backend lo requiere
        if (clienteSeleccionado?.value) {
          formData.append("usuario_id", clienteSeleccionado.value);
        }

        setIsLoading(true);
        const response = await subirCSV(formData);

        // Paso 3: Mostrar resumen del backend
        if (response.success) {
          // Mostrar mensaje del backend (puede ser un objeto con detalles)
          const mensajeBackend =
            response.data?.message ||
            response.data ||
            "Archivo subido exitosamente";
          const mensajeFormateado =
            typeof mensajeBackend === "string"
              ? mensajeBackend
              : JSON.stringify(mensajeBackend, null, 2);

          await Swal.fire({
            title: "¡Importación completada!",
            html: `
              <div">
                <p">${mensajeFormateado}</p>
                <p">✅ ${response.data.data.registros_insertados} registro(s) importado(s)</p>
                <p">⚠️ ${response.data.data.registros_con_error} registro(s) con error</p>
              </div>
            `,
            icon: "success",
            ...swalStyles,
          });
          // Recargar la información
          cargarInformacion();
        } else {
          // Mostrar error del backend
          await Swal.fire({
            title: "Error en la importación",
            text: response.error || "No se pudo subir el archivo",
            icon: "error",
            ...swalStyles,
          });
        }
        setIsLoading(false);
      }

      // Limpiar el input
      event.target.value = "";
    } catch (error) {
      console.error("Error al leer el archivo:", error);
      toast.error("Error al leer el archivo CSV");
      event.target.value = ""; // Limpiar el input
    }
  };

  return {
    refInputFile,
    manejarSubidaCSV,
    onFileSelected,
  };
};

