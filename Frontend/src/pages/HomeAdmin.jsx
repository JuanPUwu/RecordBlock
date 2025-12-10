// Estilos
import "../css/home.css";
import "../css/swalStyles.css";
import "../css/swalTableCSVStyles.css";
import selectNavStyles from "../css/selectNavStyles.js";
import swalStyles from "../css/swalStyles.js";
import swalStylesCSV from "../css/swalStylesCSV.js";
import swalStylesConfirmCSV from "../css/swalStylesConfirmCSV.js";

// Hooks
import { useAuth } from "../context/AuthContext";

// Servicios
import { useUsuarioService } from "../services/usuarioService.js";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";
import { useDatosMinimosService } from "../services/datosMinimos.js";

// Librerias
import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Popup from "reactjs-popup";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Eschemas
import {
  schemaCrearUsuario,
  schemaCambiarContraseña,
} from "../validations/eschemas";

// Utils
import { resaltarTexto } from "../utils/textUtils.jsx";
import { parseDateDMY } from "../utils/dateHelper.js";

// Componentes
import Nav from "../components/Nav.jsx";
import SepHrz from "../components/SepHrz.jsx";
import Select from "react-select";
import SearchNav from "../components/SearchNav.jsx";
import CardAdmin from "../components/CardAdmin.jsx";
import CardUsuario from "../components/CardUsuario.jsx";
import Spinner from "../components/Spinner.jsx";

// Imagenes
import imgCrearCliente from "../assets/img/añadir.webp";
import imgSalir from "../assets/img/salir.webp";
import imgUsuario from "../assets/img/usuario.webp";
import imgVisibility from "../assets/img/ojo.webp";
import imgLimpiar from "../assets/img/reset.webp";
import imgSearch from "../assets/img/busqueda.webp";
import imgCandado from "../assets/img/candado.webp";
import imgBorrar from "../assets/img/basura.webp";
import imgEditar from "../assets/img/editar.webp";
import imgAgregarFila from "../assets/img/agregarFila.webp";
import imgCrearRegistro from "../assets/img/flecha.webp";
import imgExcell from "../assets/img/excell.webp";
import imgPdf from "../assets/img/pdf.webp";
import imgVacio from "../assets/img/vacio.webp";
import imgGuardar from "../assets/img/guardar.webp";
import imgSubirArchivo from "../assets/img/subirArchivo.webp";

export default function HomeAdmin() {
  // ? Inicio Manejo formularios ->
  // Formulario Crear Usuario
  const {
    register: registerCrear,
    handleSubmit: handleSubmitCrear,
    reset: resetCrear,
    formState: { errors: errorsCrear, isSubmitting: isSubmittingCrear },
  } = useForm({
    resolver: yupResolver(schemaCrearUsuario),
  });

  // Formulario Cambiar Contraseña
  const {
    register: registerCambiar,
    handleSubmit: handleSubmitCambiar,
    reset: resetCambiar,
    formState: { errors: errorsCambiar, isSubmitting: isSubmittingCambiar },
  } = useForm({
    resolver: yupResolver(schemaCambiarContraseña),
  });
  // ? <- Fin Manejo formularios

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio utils
  // Estado del cliente actualmente seleccionado
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Usuario actual
  const { user } = useAuth();

  // Terminsmo de busqueda dato/detalle
  const [terminosBusqueda, setTerminosBusqueda] = useState({
    dato: "",
    detalle: "",
  });

  // Exportar como PDF
  const exportarComoPDF = async () => {
    setIsLoading(true);
    const { exportarPDF } = await import("../utils/pdfUtils.js");
    try {
      await exportarPDF(whichInfo, opcionesClientes);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar como excell
  const exportarComoExcell = async () => {
    setIsLoading(true);
    const { exportarExcel } = await import("../utils/excellUtils.js");
    try {
      await exportarExcel(whichInfo, opcionesClientes);
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const [isInfoCargando, setIsInfoCargando] = useState(true);

  const { obtenerDatosMinimos, remplazarDatosMinimos } =
    useDatosMinimosService();
  const [datosMinimos, setDatosMinimos] = useState([]);
  const [popUpEditarDatosMinimos, setPopUpEditarDatosMinimos] = useState(false);
  const [draftDatosMinimos, setDraftDatosMinimos] = useState([]);
  const obtenerDatosMin = async () => {
    setIsLoading(true);
    const response = await obtenerDatosMinimos();

    setDatosMinimos(response.data.data);
    const datosMinimosArray =
      response.data.data.length > 0
        ? response.data.data.map((item) => ({
            key: item,
            value: "",
          }))
        : [];
    // Siempre agregar un campo vacío adicional además de los datos mínimos
    setDraftCrear([...datosMinimosArray, { key: "", value: "" }]);
    setIsLoading(false);
  };
  // ? <- Fin utils

  // * <-------------------------------------------------------------------------------->

  // ? Inicio traer clientes/acciones ->
  // traer clientes
  const [clientes, setClientes] = useState([]);
  const [opcionesClientes, setOpcionesClientes] = useState([]);
  const { obtenerUsuarios } = useUsuarioService();
  const obtenerClientes = async () => {
    const response = await obtenerUsuarios();
    setClientes(response.data.data);
    setOpcionesClientes(
      response.data.data
        .filter((c) => c.verificado === 1)
        .map((c) => ({
          value: c.id,
          label: c.nombre,
        }))
    );
    setOpcionesClientesTabla(response.data.data);
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  // Buscar clientes nav
  const [resultadosBusquedaClientes, setResultadosBusquedaClientes] = useState(
    []
  );
  const buscarCliente = async (e) => {
    if (e.target.value === "") {
      setResultadosBusquedaClientes([]);
      return;
    }
    const resultados = opcionesClientes.filter((o) =>
      o.label.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setResultadosBusquedaClientes(resultados);
  };

  // Buscar clientes tabla usuarios
  const [opcionesClientesTabla, setOpcionesClientesTabla] = useState([]);
  const buscarClienteTabla = async (e) => {
    const valor = e.target.value.toLowerCase();

    if (valor === "") {
      setOpcionesClientesTabla(clientes);
      return;
    }

    const resultados = clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(valor) ||
        c.email.toLowerCase().includes(valor)
    );

    setOpcionesClientesTabla(resultados);
  };

  // Accion al selecionar un cliente en select o busqueda
  const refBusquedaCliente = useRef();
  const seleccionBusqueda = (cliente) => {
    if (clienteSeleccionado === cliente) {
      refBusquedaCliente.current.value = "";
      setResultadosBusquedaClientes([]);
      return;
    }
    refBusquedaCliente.current.value = "";
    setResultadosBusquedaClientes([]);
    setClienteSeleccionado(cliente);
  };
  // ? <- Fin traer clientes/acciones

  // * <-------------------------------------------------------------------------------->

  // ? Inicio crear cliente/acciones ->
  // Estado popUp formulario crear cliente
  const [popUpCrearCliente, setPopUpCrearCliente] = useState(false);

  // Estado para ver las contraseñas
  const [verPassword, setVerPassword] = useState("password");
  const [verPassword2, setVerPassword2] = useState("password");

  // Crear cliente
  const { crearUsuario } = useUsuarioService();
  const crearCliente = async (data) => {
    // Quitamos password2 antes de enviar
    const { password2, ...usuario } = data;
    const response = await crearUsuario(usuario);
    if (response.success) {
      toast.success("Cliente creado con éxito\n¡Verificación pendiente!");
      obtenerClientes();
    } else {
      toast.error(response.error);
      return;
    }
    setPopUpCrearCliente(false);
  };
  // ? <- Fin Crear cliente/acciones

  // * <-------------------------------------------------------------------------------->

  // ? Inicio editar contraseña cliente/acciones ->
  const [popUpUsuarios, setPopUpUsuarios] = useState(false);
  const [popUpEditarContrasena, setPopUpEditarContrasena] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const { actualizarUsuario } = useUsuarioService();
  const editarContraseña = async (data) => {
    setIsLoading(true);
    const response = await actualizarUsuario(
      usuarioSeleccionado.id,
      data.password
    );
    if (response.success) {
      setIsLoading(false);
      toast.success("Contraseña cambiada con éxito");
      setUsuarioSeleccionado(null);
      setPopUpEditarContrasena(false);
    } else {
      setIsLoading(false);
      toast.error(response.error);
    }
  };
  // ? <- Fin editar cliente/acciones

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio eliminar cliente/acciones
  const { eliminarUsuario } = useUsuarioService();
  const eliminarCliente = async (cliente) => {
    const result = await Swal.fire({
      title: `¿Eliminar cliente ${cliente.nombre}?`,
      text: "Esta acción es irreversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Eliminar",
      cancelButtonText: "Cancelar",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      // Si el usuario confirma, eliminamos el cliente
      const response = await eliminarUsuario(cliente.id);

      if (response.success) {
        setIsLoading(false);
        toast.success(`Cliente ${cliente.nombre} eliminado`);
        // Si el cliente eliminado estaba seleccionado, limpiar la selección
        if (clienteSeleccionado?.value === cliente.id) {
          setClienteSeleccionado(null);
          refBusquedaCliente.current.value = "";
          setResultadosBusquedaClientes([]);
        }
        // Actualizar la lista de clientes
        obtenerClientes();
        // No es necesario recargar la información:
        // - Si el cliente eliminado era el seleccionado, ya limpiamos la selección
        // - Si el cliente eliminado NO era el seleccionado, la información mostrada sigue siendo válida
      } else {
        setIsLoading(false);
        toast.error(response.error || "No se pudo eliminar el cliente");
      }
    }
  };
  // ? <- Fin eliminar cliente/acciones

  // ? -> Inicio ver info cliente
  const { obtenerInformacion } = useInfoUsuarioService();
  const [whichInfo, setWhichInfo] = useState([]);
  const refInformacion = useRef(null);
  const cargarInformacion = async () => {
    setIsInfoCargando(true);
    const response = await obtenerInformacion(clienteSeleccionado?.value);
    refInformacion.current = response.data.data;
    filtroInformacion();
  };

  useEffect(() => {
    cargarInformacion();
  }, [clienteSeleccionado]);

  // Filtrador de informacion
  const refDato = useRef();
  const refDetalle = useRef();
  const [isDatoValue, setIsDatoValue] = useState(false);
  const [isDetalleValue, setIsDetalleValue] = useState(false);
  const [filtrarPorFecha, setFiltrarPorFecha] = useState(false);
  // Ref para mantener el valor más reciente de filtrarPorFecha y evitar problemas de closure
  const refFiltrarPorFecha = useRef(filtrarPorFecha);

  // Actualizar el ref cuando cambia el estado
  useEffect(() => {
    refFiltrarPorFecha.current = filtrarPorFecha;
  }, [filtrarPorFecha]);

  // Función para detectar si un valor es una fecha válida y convertirla
  const obtenerFechaDeValor = (valor) => {
    if (typeof valor !== "string") return null;
    const valorTrimmed = valor.trim();
    // Buscar patrón de fecha DD-MM-YYYY o DD/MM/YYYY
    const fechaRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
    if (fechaRegex.test(valorTrimmed)) {
      return parseDateDMY(valorTrimmed);
    }
    return null;
  };

  // Función para filtrar información por fechas de 3 meses
  const filtrarPorFechas = (infoArray, activarFiltro) => {
    // Si no se activa el filtro, retornar el array sin modificar
    if (!activarFiltro) return infoArray;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día

    // Calcular la fecha límite (3 meses en el futuro)
    const fechaLimite = new Date(hoy);
    fechaLimite.setMonth(fechaLimite.getMonth() + 3);

    return infoArray.filter((info) => {
      // Buscar en todos los objetos de datos
      for (const datoObj of info.datos) {
        // Buscar específicamente en el campo "licenciamiento" (insensible a mayúsculas/minúsculas)
        const campoBuscado = "licenciamiento";
        const claveEncontrada = Object.keys(datoObj).find(
          (key) => key.toLowerCase() === campoBuscado.toLowerCase()
        );

        if (claveEncontrada) {
          const valorAComparar = datoObj[claveEncontrada];
          if (valorAComparar) {
            const fecha = obtenerFechaDeValor(valorAComparar);
            if (fecha) {
              // Si encontramos una fecha válida, verificar si está dentro de 3 meses
              const fechaNormalizada = new Date(fecha);
              fechaNormalizada.setHours(0, 0, 0, 0);

              // Mantener el registro si la fecha es menor a 3 meses en el futuro
              if (fechaNormalizada <= fechaLimite) {
                return true;
              }
            }
          }
        }
      }
      // Si no encontramos fechas válidas o ninguna está dentro del rango, quitar el registro
      return false;
    });
  };

  const filtroInformacion = (valorCheckbox = null) => {
    // Si se pasa un valor explícito del checkbox (true o false), usarlo
    // Si se pasa null o undefined, usar el estado actual directamente (no el ref)
    // Esto asegura que siempre tengamos el valor más reciente del estado
    const debeFiltrarPorFecha =
      valorCheckbox === true || valorCheckbox === false
        ? valorCheckbox
        : filtrarPorFecha;

    // Obtener valores de los refs si existen, sino usar strings vacíos
    const valorDato = refDato.current?.value || "";
    const valorDetalle = refDetalle.current?.value || "";
    const dato = valorDato.trim().toLowerCase();
    const detalle = valorDetalle.trim().toLowerCase();

    setTerminosBusqueda({ dato, detalle });

    // Empezar con todos los datos originales
    let datosFiltrados = refInformacion.current || [];

    // Aplicar filtro de búsqueda sobre los datos originales
    if (dato || detalle) {
      if (dato) {
        setIsDatoValue(true);
      } else {
        setIsDatoValue(false);
      }

      if (detalle) {
        setIsDetalleValue(true);
      } else {
        setIsDetalleValue(false);
      }

      datosFiltrados = datosFiltrados.filter((info) => {
        const dataObj = info.datos[0] || {};
        const keys = Object.keys(dataObj);

        return keys.some((k) => {
          const keyLower = k.toLowerCase();
          const valueLower = String(dataObj[k]).toLowerCase();

          const matchDato = dato ? keyLower.includes(dato) : true;
          const matchDetalle = detalle ? valueLower.includes(detalle) : true;

          return matchDato && matchDetalle;
        });
      });
    } else {
      setIsDatoValue(false);
      setIsDetalleValue(false);
    }

    // Aplicar filtro de fechas SOLO si el checkbox está activado
    // Esto debe aplicarse después del filtro de búsqueda
    datosFiltrados = filtrarPorFechas(datosFiltrados, debeFiltrarPorFecha);

    setWhichInfo(datosFiltrados);
    setIsInfoCargando(false);
  };
  // ? <- Fin ver info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio crear info cliente
  const [popUpCrearInfo, setPopUpCrearInfo] = useState(false);
  const [draftCrear, setDraftCrear] = useState([]);

  const { crearInformacion } = useInfoUsuarioService();
  const { subirCSV } = useInfoUsuarioService();
  const refInputFile = useRef(null);

  // Cambiar clave
  const cambiarLlaveCrear = (index, newKey) => {
    const copy = [...draftCrear];
    copy[index].key = newKey;
    setDraftCrear(copy);
  };

  // Cambiar valor
  const cambiarValorCrear = (index, newValue) => {
    const copy = [...draftCrear];
    copy[index].value = newValue;
    setDraftCrear(copy);
  };

  // Eliminar par
  const eliminarDatoCrear = (index) => {
    // No permitir eliminar si solo queda un campo (debe haber mínimo uno)
    if (draftCrear.length <= 1) {
      toast.error("Debe haber al menos un campo");
      return;
    }

    const copy = [...draftCrear];
    copy.splice(index, 1);
    setDraftCrear(copy);
  };

  // Agregar par nuevo
  const scrollCrearRef = useRef(null);
  const inputCrearRef = useRef(null);
  const agregarDatoCrear = () => {
    // Validar que no haya un par vacío ya
    const hayVacio = draftCrear.some(
      (d) => d.key.trim() === "" && d.value.trim() === ""
    );
    if (hayVacio) {
      toast.error("Completa el campo vacío\nantes de agregar uno nuevo");
      return;
    }

    setDraftCrear([...draftCrear, { key: "", value: "" }]);

    requestAnimationFrame(() => {
      if (scrollCrearRef.current) {
        scrollCrearRef.current.scrollTo({
          top: scrollCrearRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        if (inputCrearRef.current) {
          inputCrearRef.current.focus();
        }
      }, 250);
    });
  };

  // Función para parsear CSV
  const parsearCSV = (texto) => {
    const lineas = texto.split("\n").filter((linea) => linea.trim() !== "");
    if (lineas.length === 0) return { headers: [], filas: [] };

    // Función auxiliar para parsear una línea CSV (delimitado por punto y coma)
    const parsearLineaCSV = (linea) => {
      const valores = [];
      let valorActual = "";
      let dentroComillas = false;

      for (const char of linea) {
        if (char === '"') {
          dentroComillas = !dentroComillas;
        } else if (char === ";" && !dentroComillas) {
          valores.push(valorActual.trim().replaceAll(/(?:^"|"$)/g, ""));
          valorActual = "";
        } else {
          valorActual += char;
        }
      }
      valores.push(valorActual.trim().replaceAll(/(?:^"|"$)/g, "")); // Último valor

      return valores;
    };

    // Obtener headers (primera línea)
    const headers = parsearLineaCSV(lineas[0]);

    // Parsear filas (resto de líneas)
    const filas = lineas.slice(1).map((linea) => parsearLineaCSV(linea));

    return { headers, filas };
  };

  // Función para generar tabla HTML del CSV
  const generarTablaCSV = (headers, filas) => {
    const maxFilasMostrar = 50; // Limitar a 50 filas para no sobrecargar
    const filasAMostrar = filas.slice(0, maxFilasMostrar);
    const hayMasFilas = filas.length > maxFilasMostrar;

    let tablaHTML = `
      <div class="cont-tabla-csv">
        <table>
          <thead>
            <tr>
    `;

    // Headers
    for (const header of headers) {
      tablaHTML += `<th>${header}</th>`;
    }
    tablaHTML += `</tr></thead><tbody>`;

    // Filas
    for (const fila of filasAMostrar) {
      tablaHTML += `<tr>`;
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const valor = fila[colIndex] || "";
        tablaHTML += `<td title="${valor}">${valor}</td>`;
      }
      tablaHTML += `</tr>`;
    }

    tablaHTML += `</tbody></table></div>`;

    if (hayMasFilas) {
      tablaHTML += `<p>Mostrando ${maxFilasMostrar} de ${filas.length} filas...</p>`;
    }

    return tablaHTML;
  };

  // Función para subir archivo CSV
  const manejarSubidaCSV = async () => {
    // Validar que haya un cliente seleccionado
    if (!clienteSeleccionado) {
      toast.error("Debes seleccionar un cliente primero");
      return;
    }

    // Abrir el selector de archivos
    refInputFile.current?.click();
  };

  // Función que se ejecuta cuando se selecciona un archivo
  const onFileSelected = async (event) => {
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
          // Cerrar el popup de crear info
          setPopUpCrearInfo(false);
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

  // Guardar nueva información
  const crearRegistro = async () => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // Limpiar campos vacíos
    const cleanedDraft = draftCrear.filter(
      (d) => d.key.trim() !== "" || d.value.trim() !== ""
    );

    // Validaciones
    const emptyKey = cleanedDraft.find(
      (d) => d.key.trim() === "" && d.value.trim() !== ""
    );
    if (emptyKey) {
      toast.error(`El detalle "${emptyKey.value}" no tiene dato`);
      return;
    }

    const emptyValue = cleanedDraft.find(
      (d) => d.value.trim() === "" && d.key.trim() !== ""
    );
    if (emptyValue) {
      toast.error(`El dato "${emptyValue.key}" no tiene detalle`);
      return;
    }

    // Verificar mínimo 1 par válido
    if (cleanedDraft.length === 0) {
      toast.error("Ingresa por lo menos un dato válido");
      return;
    }

    // Validar que no haya emojis
    for (const { key, value } of cleanedDraft) {
      if (!noEmojisRegex.test(key.trim())) {
        toast.error(`El dato "${key}" contiene emojis, no es valido`);
        return;
      }
      if (!noEmojisRegex.test(value.trim())) {
        toast.error(`El detalle "${value}" contiene emojis, no es valido`);
        return;
      }
    }

    const keys = cleanedDraft.map((d) => d.key.trim());
    const lowerKeys = keys.map((k) => k.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerKeys.length; i++) {
      if (seen.has(lowerKeys[i])) {
        toast.error(`El dato "${keys[i]}" ya existe`);
        return;
      }
      seen.set(lowerKeys[i], true);
    }

    // Convertir a objeto
    const obj = cleanedDraft.reduce((acc, { key, value }) => {
      acc[key.trim()] = value.trim();
      return acc;
    }, {});

    // Crear payload
    const nuevaInfo = {
      usuario_id: clienteSeleccionado.value,
      datos: obj,
    };

    setIsLoading(true);
    const response = await crearInformacion(nuevaInfo);

    if (response.success) {
      toast.success(`Registro creado con éxito`);
      cargarInformacion();
      setPopUpCrearInfo(false);
      setIsLoading(false);
    } else {
      toast.error(response.error);
      setIsLoading(false);
    }
  };
  // ? <- Fin crear info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio editar info cliente
  const [popUpEditarInfo, setPopUpEditarInfo] = useState(false);
  const [infoSeleccionada, setInfoSeleccionada] = useState(null);
  const [infoAEditar, setInfoAEditar] = useState(null);
  const [draftDatos, setDraftDatos] = useState([]);

  useEffect(() => {
    if (infoAEditar) {
      // Pasamos los datos de objeto -> array de pares clave/valor
      const entries = Object.entries(infoAEditar.datos[0]).map(([k, v]) => ({
        key: k,
        value: v,
      }));
      // Siempre agregar un campo vacío adicional para poder agregar nuevos datos
      setDraftDatos([...entries, { key: "", value: "" }]);
    }
  }, [infoAEditar]);

  // Cambiar clave
  const cambiarLlaveDraft = (index, newKey) => {
    const copy = [...draftDatos];
    copy[index].key = newKey;
    setDraftDatos(copy);
  };

  // Cambiar valor
  const cambiarValorDraft = (index, newValue) => {
    const copy = [...draftDatos];
    copy[index].value = newValue;
    setDraftDatos(copy);
  };

  // Eliminar par
  const eliminarDatoDraft = (index) => {
    // No permitir eliminar si solo queda un campo (debe haber mínimo uno)
    if (draftDatos.length <= 1) {
      toast.error("Debe haber al menos un campo");
      return;
    }

    const copy = [...draftDatos];
    copy.splice(index, 1);
    setDraftDatos(copy);
  };

  // Agregar par nuevo
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const agregarDatoDraft = () => {
    // Validar que no haya un par vacío ya
    const hayVacio = draftDatos.some(
      (d) => d.key.trim() === "" && d.value.trim() === ""
    );
    if (hayVacio) {
      toast.error("Completa el campo vacío\nantes de agregar uno nuevo");
      return;
    }

    setDraftDatos([...draftDatos, { key: "", value: "" }]);

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 250);
    });
  };

  // Guardar cambios
  const { actualizarInformacion } = useInfoUsuarioService();
  const editarRegistro = async () => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // 🔹 Limpiar campos vacíos totalmente {"": ""}
    const cleanedDraft = draftDatos.filter(
      (d) => d.key.trim() !== "" || d.value.trim() !== ""
    );

    // 🔹 Validar claves vacías
    const emptyKey = cleanedDraft.find(
      (d) => d.key.trim() === "" && d.value.trim() !== ""
    );
    if (emptyKey) {
      toast.error(`El detalle "${emptyKey.value}" no tiene dato`);
      return;
    }

    // 🔹 Validar valores vacíos
    const emptyValue = cleanedDraft.find(
      (d) => d.value.trim() === "" && d.key.trim() !== ""
    );
    if (emptyValue) {
      toast.error(`El dato "${emptyValue.key}" no tiene detalle`);
      return;
    }

    // 🔹 Validar que quede al menos un par válido (clave y valor completos)
    const paresValidos = cleanedDraft.filter(
      (d) => d.key.trim() !== "" && d.value.trim() !== ""
    );
    if (paresValidos.length === 0) {
      toast.error("El registro debe tener por lo menos un dato válido");
      return;
    }

    // 🔹 Validar que no haya emojis en keys ni values
    for (const { key, value } of paresValidos) {
      if (!noEmojisRegex.test(key.trim())) {
        toast.error(`El dato "${key}" contiene emojis, no es valido`);
        return;
      }
      if (!noEmojisRegex.test(value.trim())) {
        toast.error(`El detalle "${value}" contiene emojis, no es valido`);
        return;
      }
    }

    // 🔹 Validar duplicados (ignorando mayúsculas/minúsculas)
    const keys = paresValidos.map((d) => d.key.trim());
    const lowerKeys = keys.map((k) => k.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerKeys.length; i++) {
      const k = lowerKeys[i];
      if (seen.has(k)) {
        toast.error(`El dato "${keys[i]}" ya existe`);
        return;
      }
      seen.set(k, true);
    }

    // 🔹 Convertir a objeto limpio (solo pares válidos)
    const obj = paresValidos.reduce((acc, { key, value }) => {
      acc[key.trim()] = value.trim();
      return acc;
    }, {});

    // 🔹 Crear info actualizada
    const infoActualizada = { ...infoAEditar, datos: obj };

    // 🔹 Normalizar datos de infoSeleccionada para comparación
    const datosSeleccionados = Array.isArray(infoSeleccionada.datos)
      ? infoSeleccionada.datos[0] // asumimos un solo objeto
      : infoSeleccionada.datos;

    const infoSeleccionadaNormalized = {
      ...infoSeleccionada,
      datos: datosSeleccionados,
    };

    // 🔹 Si no hay cambios no hace nada
    if (
      JSON.stringify(infoSeleccionadaNormalized) ===
      JSON.stringify(infoActualizada)
    ) {
      setPopUpEditarInfo(false);
      return;
    }

    // 🔹 Enviar actualización
    setIsLoading(true);
    const response = await actualizarInformacion(infoActualizada);
    if (response.success) {
      toast.success(`Registro °${infoActualizada.info_id} actualizado`);
      cargarInformacion();
      setPopUpEditarInfo(false);
      setIsLoading(false);
    } else {
      toast.error(response.error);
      setIsLoading(false);
    }
  };
  // ? <- Fin editar info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio eliminar informacion cliente
  const { eliminarInformacion } = useInfoUsuarioService();
  const eliminarInformacionCliente = async (info) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de eliminar el registro °${info.info_id}?`,
      text: "Esta acción es irreversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Eliminar",
      cancelButtonText: "Cancelar",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      // Crear objeto con solo las propiedades necesarias
      const infoEliminar = {
        info_id: info.info_id,
        usuario_id: info.usuario_id,
      };

      setIsLoading(true);
      const response = await eliminarInformacion(infoEliminar);
      if (response.success) {
        setIsLoading(false);
        toast.success(`Información °${info.info_id} eliminada`);
        cargarInformacion();
      } else {
        setIsLoading(false);
        toast.error(response.error);
      }
    }
  };
  // ? <- Fin eliminar informacion cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio editar datos minimos
  // Inicializar draft cuando se abre el popup
  useEffect(() => {
    if (popUpEditarDatosMinimos) {
      // Si no hay datos mínimos, inicializar con al menos un elemento vacío
      if (!datosMinimos || datosMinimos.length === 0) {
        setDraftDatosMinimos([""]);
      } else {
        setDraftDatosMinimos([...datosMinimos]);
      }
    } else {
      setDraftDatosMinimos([]);
    }
  }, [popUpEditarDatosMinimos, datosMinimos]);

  // Cambiar valor de dato minimo
  const cambiarDatoMinimo = (index, newValue) => {
    const copy = [...draftDatosMinimos];
    copy[index] = newValue;
    setDraftDatosMinimos(copy);
  };

  // Eliminar dato minimo
  const eliminarDatoMinimo = (index) => {
    // Si solo queda un elemento y tiene contenido, resetearlo a vacío
    if (draftDatosMinimos.length <= 1) {
      const copy = [...draftDatosMinimos];
      copy[index] = "";
      setDraftDatosMinimos(copy);
      return;
    }
    const copy = [...draftDatosMinimos];
    copy.splice(index, 1);
    setDraftDatosMinimos(copy);
  };

  // Agregar dato minimo nuevo
  const scrollDatosMinimosRef = useRef(null);
  const inputDatosMinimosRef = useRef(null);
  const agregarDatoMinimo = () => {
    // Validar que no haya un dato vacío ya
    const hayVacio = draftDatosMinimos.some((d) => d.trim() === "");
    if (hayVacio) {
      toast.error("Completa el dato vacío\nantes de agregar uno nuevo");
      return;
    }

    setDraftDatosMinimos([...draftDatosMinimos, ""]);

    requestAnimationFrame(() => {
      if (scrollDatosMinimosRef.current) {
        scrollDatosMinimosRef.current.scrollTo({
          top: scrollDatosMinimosRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        if (inputDatosMinimosRef.current) {
          inputDatosMinimosRef.current.focus();
        }
      }, 250);
    });
  };

  // Guardar datos minimos
  const guardarDatosMinimos = async () => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // Limpiar datos vacíos
    const cleanedDraft = draftDatosMinimos
      .map((d) => d.trim())
      .filter((d) => d !== "");

    // Normalizar arrays para comparación (ordenar y convertir a minúsculas)
    const normalizedDraft = cleanedDraft
      .map((d) => d.toLowerCase())
      .sort((a, b) => a.localeCompare(b));
    const normalizedOriginal = datosMinimos
      .map((d) => d.toLowerCase())
      .sort((a, b) => a.localeCompare(b));

    // Si no hay cambios, cerrar popup y no hacer nada
    if (
      normalizedDraft.length === normalizedOriginal.length &&
      normalizedDraft.every((d, i) => d === normalizedOriginal[i])
    ) {
      setPopUpEditarDatosMinimos(false);
      return;
    }

    // Validar que no haya emojis
    for (const dato of cleanedDraft) {
      if (!noEmojisRegex.test(dato)) {
        toast.error(`El dato "${dato}" contiene emojis, no es válido`);
        return;
      }
    }

    // Validar duplicados (ignorando mayúsculas/minúsculas)
    const lowerDatos = cleanedDraft.map((d) => d.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerDatos.length; i++) {
      const d = lowerDatos[i];
      if (seen.has(d)) {
        toast.error(`El dato "${cleanedDraft[i]}" ya existe`);
        return;
      }
      seen.set(d, true);
    }

    // Modificar lista de datosMinimos
    setIsLoading(true);
    const response = await remplazarDatosMinimos(cleanedDraft);
    if (response.success) {
      obtenerDatosMin();
      setIsLoading(false);
      toast.success("Datos mínimos guardados");
    } else {
      console.error(response.error);
      setIsLoading(false);
    }

    setPopUpEditarDatosMinimos(false);
  };
  // ? <- Fin editar datos minimos

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio logout/acciones
  // Cerrar sesion
  const { logout } = useAuth();
  const cerrarSesion = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Tendrás que iniciar sesión nuevamente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Salir",
      cancelButtonText: "No, Volver",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await logout();
      } catch (error) {
        console.error("Error en logout:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // ? <- Fin logout/acciones

  // Función para manejar el click de editar información
  const handleEditarInfo = (info) => {
    setInfoSeleccionada(info);
    setInfoAEditar({
      ...info,
      datos: info.datos.map((dato) => ({ ...dato })),
    });
    setPopUpEditarInfo(true);
  };

  // Función para renderizar una columna de datos
  const renderizarColumnaDatos = (entries) => {
    return entries.map(([key, value]) => (
      <p key={key}>
        <strong>{resaltarTexto(key, terminosBusqueda.dato, true)}:</strong>{" "}
        {resaltarTexto(value, terminosBusqueda.detalle, false)}
      </p>
    ));
  };

  // Función para renderizar los datos de un registro
  const renderizarDatosRegistro = (dato, i) => {
    const entries = Object.entries(dato);
    const mitad = Math.ceil(entries.length / 2);
    const colIzq = entries.slice(0, mitad);
    const colDer = entries.slice(mitad);
    const uniqueKey = Object.keys(dato).join("-") || `dato-${i}`;

    return (
      <div className="cont-dato" key={uniqueKey}>
        <div className="columna">{renderizarColumnaDatos(colIzq)}</div>
        <div className="columna">{renderizarColumnaDatos(colDer)}</div>
      </div>
    );
  };

  // Función para renderizar un item de información
  const renderizarItemInfo = (info) => {
    return (
      <div className="item" key={info.info_id}>
        <h3>
          <button onClick={() => handleEditarInfo(info)}>
            <img src={imgEditar} alt="" />
          </button>
          {`Registro °${info.info_id} - ${info.usuario_nombre}`}
          <button onClick={() => eliminarInformacionCliente(info)}>
            <img src={imgBorrar} alt="" />
          </button>
        </h3>
        {info.datos.map((dato, i) => renderizarDatosRegistro(dato, i))}
      </div>
    );
  };

  // Función para renderizar el contenido principal
  const renderizarContenidoPrincipal = () => {
    if (isInfoCargando) {
      return <div className="loader section"></div>;
    }

    if (whichInfo.length === 0) {
      return (
        <div className="cont-sin-resultados">
          <img src={imgVacio} alt="" />
          <span>No se encontraron resultados</span>
        </div>
      );
    }

    return (
      <>
        {[0, 1].map((col) => {
          // Obtener los índices de los elementos que pertenecen a esta columna
          const indicesColumna = whichInfo
            .map((_, index) => (index % 2 === col ? index : null))
            .filter((idx) => idx !== null);

          // Verificar si hay registros en esta columna
          const tieneRegistros = indicesColumna.length > 0;

          return (
            <div key={col}>
              {whichInfo.map((info, index) => {
                if (index % 2 === col) {
                  return renderizarItemInfo(info);
                }
                return null;
              })}
              {tieneRegistros && <div className="cont-final-columna"></div>}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      {/* Loader */}
      {isLoading && <Spinner />}

      {/* Nav */}
      <Nav>
        <button
          onClick={() => {
            obtenerClientes();
            setPopUpUsuarios(true);
          }}
          className="btn-nav btn-nav-primary"
          title="Gestión de usuarios"
        >
          <img src={imgUsuario} alt="" />
        </button>
        <Select
          styles={selectNavStyles}
          options={opcionesClientes}
          onChange={seleccionBusqueda}
          onMenuOpen={() => obtenerClientes()}
          value={clienteSeleccionado}
          isSearchable={false}
          placeholder="Seleccione un cliente..."
        />
        <span>o</span>
        <div className="cont-inpNav">
          <input
            type="text"
            placeholder="Busque por cliente..."
            onInput={(e) => buscarCliente(e)}
            ref={refBusquedaCliente}
          />
          <img src={imgSearch} alt="" />
          {resultadosBusquedaClientes.length > 0 && (
            <div>
              {resultadosBusquedaClientes.map((c) => (
                <button key={c.value} onClick={() => seleccionBusqueda(c)}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setClienteSeleccionado(null);
            refBusquedaCliente.current.value = "";
            setResultadosBusquedaClientes([]);
            toast.success("Cliente restablecido");
          }}
          className={`btn-nav btn-nav-secondary ${
            clienteSeleccionado === null ? "btn-disabled" : ""
          }`}
          title="Restablecer cliente seleccionado"
          disabled={clienteSeleccionado === null}
        >
          <img src={imgLimpiar} alt="" />
        </button>
        <button
          className={`btn-nav btn-nav-success ${
            clienteSeleccionado === null ? "btn-disabled" : ""
          }`}
          title="Crear registro"
          disabled={clienteSeleccionado === null}
          onClick={async () => {
            await obtenerDatosMin();
            setPopUpCrearInfo(true);
          }}
        >
          <img src={imgCrearRegistro} alt="" />
        </button>
        <SearchNav
          refDato={refDato}
          onInputDato={filtroInformacion}
          refDetalle={refDetalle}
          onInputDetalle={filtroInformacion}
          clearDato={() => {
            refDato.current.value = "";
            filtroInformacion();
          }}
          clearDetalle={() => {
            refDetalle.current.value = "";
            filtroInformacion();
          }}
          isDatoValue={isDatoValue}
          isDetalleValue={isDetalleValue}
        />
        <button
          onClick={() => exportarComoPDF()}
          className="btn-nav btn-nav-danger"
          title="Exportar a pdf"
        >
          <img src={imgPdf} alt="" />
        </button>
        <button
          onClick={() => exportarComoExcell()}
          className="btn-nav btn-nav-success"
          title="Exportar a excel"
        >
          <img src={imgExcell} alt="" />
        </button>
        <div className="cont-cant-resultados">
          <span>{whichInfo.length} Resultados</span>
          <label
            className="checkbox-moderno"
            aria-label="Mostrar licenamiento proximo a vencer"
            title="Mostrar licenamiento proximo a vencer"
          >
            <input
              type="checkbox"
              checked={filtrarPorFecha}
              onChange={(e) => {
                const nuevoValor = e.target.checked;
                setFiltrarPorFecha(nuevoValor);
                filtroInformacion(nuevoValor);
              }}
            />
            <span className="checkbox-slider"></span>
          </label>
        </div>
        <button
          onClick={cerrarSesion}
          className="btn-nav btn-nav-danger"
          title="Cerrar sesión"
        >
          <img src={imgSalir} alt="" />
        </button>
      </Nav>
      <SepHrz />

      {/* Contenido principal */}
      <section>{renderizarContenidoPrincipal()}</section>

      {/* PopUp usuarios */}
      <Popup
        open={popUpUsuarios}
        onClose={() => {
          setPopUpUsuarios(false);
          setUsuarioSeleccionado(null);
          obtenerClientes();
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>Gestión de usuarios</h2>
          <CardAdmin
            nameAdmin={user.nombre}
            isAdmin={user.isAdmin}
            onClick={() => {
              setPopUpEditarContrasena(true);
              setUsuarioSeleccionado(user);
            }}
          />
          <div className="cont-tb-usuarios">
            <div className="cont-search-new">
              <label
                className="cont-searcher"
                aria-label="Buscar usuario o cliente"
              >
                <input
                  type="text"
                  placeholder="Buscar usuario/cliente..."
                  onInput={buscarClienteTabla}
                />
                <img src={imgSearch} alt="" />
              </label>
              <button
                className="newUsuario"
                title="Crear usuario"
                onClick={() => setPopUpCrearCliente(true)}
              >
                <img src={imgCrearCliente} alt="" />
              </button>
            </div>
            <div className="tb-overflow-scroll-hiden">
              <div className="tb-usuarios">
                {opcionesClientesTabla.map((cliente) => (
                  <CardUsuario
                    key={cliente.id}
                    nameUsuario={cliente.nombre}
                    correoUsuario={cliente.email}
                    estado={cliente.verificado ? "" : "(No verificado)"}
                    onClick1={() => {
                      setPopUpEditarContrasena(true);
                      setUsuarioSeleccionado(cliente);
                    }}
                    onClick2={() => eliminarCliente(cliente)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Popup>

      {/* PopUp crear cliente */}
      <Popup
        open={popUpCrearCliente}
        onClose={() => {
          setPopUpCrearCliente(false);
          resetCrear();
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>Crear cliente</h2>
          <form onSubmit={handleSubmitCrear(crearCliente)}>
            {/* Nombre */}
            <div className="cont-label">
              <label htmlFor="crear-nombre">Nombre de usuario:</label>
              {errorsCrear.nombre && <span>{errorsCrear.nombre.message}</span>}
            </div>
            <input
              id="crear-nombre"
              type="text"
              {...registerCrear("nombre")}
              placeholder="alpina"
            />

            {/* Email */}
            <div className="cont-label">
              <label htmlFor="crear-email">Correo:</label>
              {errorsCrear.email && <span>{errorsCrear.email.message}</span>}
            </div>
            <input
              id="crear-email"
              type="text"
              {...registerCrear("email")}
              placeholder="alpina@example.com"
            />

            {/* Password */}
            <div className="cont-label">
              <label htmlFor="crear-password">Contraseña:</label>
              {errorsCrear.password && (
                <span>{errorsCrear.password.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
                id="crear-password"
                type={verPassword}
                {...registerCrear("password")}
                placeholder="∗∗∗∗∗∗∗∗∗∗"
              />
              <button
                type="button"
                onMouseDown={() => setVerPassword("text")}
                onMouseUp={() => setVerPassword("password")}
                onMouseLeave={() => setVerPassword("password")}
              >
                <img src={imgVisibility} alt="" />
              </button>
            </div>

            {/* Password2 */}
            <div className="cont-label">
              <label htmlFor="crear-password2">Confirmar contraseña:</label>
              {errorsCrear.password2 && (
                <span>{errorsCrear.password2.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
                id="crear-password2"
                type={verPassword2}
                {...registerCrear("password2")}
                placeholder="∗∗∗∗∗∗∗∗∗∗"
              />
              <button
                type="button"
                onMouseDown={() => setVerPassword2("text")}
                onMouseUp={() => setVerPassword2("password")}
                onMouseLeave={() => setVerPassword2("password")}
              >
                <img src={imgVisibility} alt="" />
              </button>
            </div>
            <SepHrz />
            <button
              type="submit"
              disabled={isSubmittingCrear}
              className="btn-form-success"
              title="Crear cliente"
            >
              <img src={imgCrearCliente} alt="" />
              Crear
              {isSubmittingCrear && <Spinner />}
            </button>
          </form>
        </div>
      </Popup>

      {/* PopUp editar contraseña */}
      <Popup
        open={popUpEditarContrasena}
        onClose={() => {
          setPopUpEditarContrasena(false);
          setUsuarioSeleccionado(null);
          resetCambiar();
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>
            Cambio de contraseña
            <br />
            {usuarioSeleccionado?.nombre}
          </h2>
          <form onSubmit={handleSubmitCambiar(editarContraseña)}>
            {/* Password 1*/}
            <div className="cont-label">
              <label htmlFor="cambiar-password">Contraseña:</label>
              {errorsCambiar.password && (
                <span>{errorsCambiar.password.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
                id="cambiar-password"
                type={verPassword}
                {...registerCambiar("password")}
                placeholder="∗∗∗∗∗∗∗∗∗∗"
              />
              <button
                type="button"
                onMouseDown={() => setVerPassword("text")}
                onMouseUp={() => setVerPassword("password")}
                onMouseLeave={() => setVerPassword("password")}
              >
                <img src={imgVisibility} alt="" />
              </button>
            </div>

            {/* Password 2*/}
            <div className="cont-label">
              <label htmlFor="cambiar-password2">Confirmar contraseña:</label>
              {errorsCambiar.password2 && (
                <span>{errorsCambiar.password2.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
                id="cambiar-password2"
                type={verPassword2}
                {...registerCambiar("password2")}
                placeholder="∗∗∗∗∗∗∗∗∗∗"
              />
              <button
                type="button"
                onMouseDown={() => setVerPassword2("text")}
                onMouseUp={() => setVerPassword2("password")}
                onMouseLeave={() => setVerPassword2("password")}
              >
                <img src={imgVisibility} alt="" />
              </button>
            </div>
            <div className="sep-hrz"></div>
            <button
              className="btn-form-warning"
              type="submit"
              disabled={isSubmittingCambiar}
              title="Cambiar contraseña"
            >
              <img src={imgCandado} alt="" />
              Cambiar
              {isSubmittingCambiar && <Spinner />}
            </button>
          </form>
        </div>
      </Popup>

      {/* PopUp crear informacion */}
      <Popup
        open={popUpCrearInfo}
        onClose={() => {
          setPopUpCrearInfo(false);
          setDraftCrear([]);
        }}
        modal
        nested
      >
        <div className="cont-popUp-editarInfo">
          <input
            type="file"
            accept=".csv"
            ref={refInputFile}
            onChange={onFileSelected}
            style={{ display: "none" }}
          />
          <button
            className="btn-change btn-subir-archivo"
            title="importar archivo CSV"
            onClick={manejarSubidaCSV}
          >
            <img src={imgSubirArchivo} alt="" />
          </button>
          <h2>
            {`${
              opcionesClientes.find(
                (c) => c.value === clienteSeleccionado?.value
              )?.label
            } - Nuevo registro`}
          </h2>
          <button
            className="btn-change"
            title="Editar datos minimos"
            onClick={() => setPopUpEditarDatosMinimos(true)}
          >
            <img src={imgEditar} alt="" />
          </button>

          <div ref={scrollCrearRef}>
            {draftCrear.map(({ key, value }, i, array) => {
              const esObligatorio = i < datosMinimos.length;
              // Usar solo el índice como key para evitar que React re-renderice y pierda el foco
              const uniqueKey = `crear-${i}`;

              return (
                <div key={uniqueKey} className="cont-dato-editar">
                  {esObligatorio ? (
                    <span>{key}</span>
                  ) : (
                    <input
                      type="text"
                      placeholder="Dato..."
                      value={key}
                      onChange={(e) => cambiarLlaveCrear(i, e.target.value)}
                      ref={i === array.length - 1 ? inputCrearRef : null}
                    />
                  )}

                  <input
                    type="text"
                    placeholder="Detalle..."
                    value={value}
                    onChange={(e) => cambiarValorCrear(i, e.target.value)}
                    className={esObligatorio ? "input-obligatorio" : ""}
                  />

                  {!esObligatorio && (
                    <button
                      type="button"
                      onClick={() => eliminarDatoCrear(i)}
                      title="Eliminar campo"
                    >
                      <img src={imgBorrar} alt="Eliminar" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sep-hrz"></div>
          <div className="cont-btns">
            <button
              type="button"
              onClick={agregarDatoCrear}
              title="Agregar campo"
            >
              <img src={imgAgregarFila} alt="" />
              <span>Agregar campo</span>
            </button>
            <button
              type="button"
              className="btn-crear"
              onClick={crearRegistro}
              title="Crear registro"
            >
              <img src={imgCrearRegistro} alt="" />
              <span>Crear</span>
            </button>
          </div>
        </div>
      </Popup>

      {/* PopUp editar informacion */}
      <Popup
        open={popUpEditarInfo}
        onClose={() => {
          setPopUpEditarInfo(false);
          setInfoSeleccionada(null);
          setInfoAEditar(null);
        }}
        modal
        nested
      >
        <div className="cont-popUp-editarInfo">
          <h2>
            {` ${
              opcionesClientes.find((c) => c.value === infoAEditar?.usuario_id)
                ?.label
            } -
      Registro °${infoAEditar?.info_id}`}
          </h2>

          <div ref={scrollRef}>
            {draftDatos.map(({ key, value }, i, array) => {
              const esObligatorio =
                i < infoAEditar?.datos_minimos_iniciales?.length;
              // Usar solo el índice como key para evitar que React re-renderice y pierda el foco
              const uniqueKey = `editar-${i}`;

              return (
                <div key={uniqueKey} className="cont-dato-editar">
                  {esObligatorio ? (
                    <span>{key}</span>
                  ) : (
                    <input
                      type="text"
                      placeholder="Dato..."
                      value={key}
                      onChange={(e) => cambiarLlaveDraft(i, e.target.value)}
                      ref={i === array.length - 1 ? inputRef : null}
                    />
                  )}

                  <input
                    type="text"
                    placeholder="Detalle..."
                    value={value}
                    onChange={(e) => cambiarValorDraft(i, e.target.value)}
                    className={esObligatorio ? "input-obligatorio" : ""}
                  />

                  {!esObligatorio && (
                    <button
                      type="button"
                      onClick={() => eliminarDatoDraft(i)}
                      title="Eliminar campo"
                    >
                      <img src={imgBorrar} alt="Eliminar" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="sep-hrz"></div>
          <div className="cont-btns">
            <button
              type="button"
              onClick={agregarDatoDraft}
              title="Agregar campo"
            >
              <img src={imgAgregarFila} alt="" />
              <span>Agregar campo</span>
            </button>
            <button
              type="button"
              onClick={editarRegistro}
              title="Guardar registro"
            >
              <img src={imgEditar} alt="" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </Popup>

      {/* PopUp editar datos minimos */}
      <Popup
        open={popUpEditarDatosMinimos}
        onClose={() => {
          setPopUpEditarDatosMinimos(false);
          setDraftDatosMinimos([]);
        }}
        modal
        nested
      >
        <div className="cont-popUp-editarInfo">
          <h2>Editar datos mínimos</h2>
          <div ref={scrollDatosMinimosRef} className="cont-datos-minimos">
            {draftDatosMinimos.map((dato, i, array) => {
              // Usar solo el índice como key para evitar que React re-renderice y pierda el foco
              const uniqueKey = `dato-min-${i}`;
              return (
                <div key={uniqueKey} className="cont-dato-editar">
                  <input
                    type="text"
                    placeholder="Dato mínimo..."
                    className="inp-dato-minimo"
                    value={dato}
                    onChange={(e) => cambiarDatoMinimo(i, e.target.value)}
                    ref={i === array.length - 1 ? inputDatosMinimosRef : null}
                  />
                  <button
                    type="button"
                    onClick={() => eliminarDatoMinimo(i)}
                    title="Eliminar dato"
                  >
                    <img src={imgBorrar} alt="Eliminar" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="sep-hrz"></div>
          <div className="cont-btns">
            <button
              type="button"
              onClick={agregarDatoMinimo}
              title="Agregar dato"
            >
              <img src={imgAgregarFila} alt="" />
              <span>Agregar dato</span>
            </button>
            <button
              type="button"
              className="btn-crear"
              onClick={guardarDatosMinimos}
              title="Guardar datos mínimos"
            >
              <img src={imgGuardar} alt="" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
