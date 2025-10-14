// Hooks
import { useAuth } from "../context/AuthContext";

// Servicios
import { useUsuarioService } from "../services/usuarioService.js";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";

// Estilos
import "../css/home.css";
import "../css/swalStyles.css";
import selectNavStyles from "../css/selectNavStyles.js";
import swalStyles from "../css/swalStyles.js";

// Librerias
import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Popup from "reactjs-popup";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Eschemas
import {
  schemaCrearUsuario,
  schemaCambiarContraseña,
} from "../validations/eschemas";

// Componentes
import Nav from "../components/Nav.jsx";
import SepHrz from "../components/SepHrz.jsx";
import Select from "react-select";
import SearchNav from "../components/SearchNav.jsx";
import CardAdmin from "../components/CardAdmin.jsx";
import CardUsuario from "../components/CardUsuario.jsx";

// Imagenes
import imgCrearCliente from "../assets/img/añadir.png";
import imgSalir from "../assets/img/salir.png";
import imgUsuario from "../assets/img/usuario.png";
import imgVisibility from "../assets/img/ojo.png";
import imgLimpiar from "../assets/img/reset.png";
import imgSearch from "../assets/img/busqueda.png";
import imgCandado from "../assets/img/candado.png";
import imgBorrar from "../assets/img/basura.png";
import imgEditar from "../assets/img/editar.png";
import imgAgregarFila from "../assets/img/agregarFila.png";
import imgCrearRegistro from "../assets/img/flecha.png";
import imgExcell from "../assets/img/excell.png";
import imgPdf from "../assets/img/pdf.png";

// Docs
import plantillaPdf from "../assets/docs/Plantilla Documento Axity Horizontal.pdf";

// Función para resaltar coincidencias
const resaltarTexto = (texto, termino, esLlave = false) => {
  if (!termino || !texto) return String(texto); // <-- asegurar string

  if (!String(texto).toLowerCase().includes(termino.toLowerCase())) {
    return String(texto); // <-- asegurar string
  }

  const regex = new RegExp(
    `(${termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const partes = String(texto).split(regex);

  return partes.map((parte, index) => {
    if (regex.test(parte)) {
      return (
        <span key={index} className={esLlave ? "highlight-key" : "highlight"}>
          {parte}
        </span>
      );
    }
    return parte;
  });
};

export default function HomeAdmin() {
  // Todo Funciones Nav

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
  const exportarPDF = async () => {
    try {
      // 🔹 1. Cargar plantilla original
      const response = await fetch(plantillaPdf);
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // 🔹 PDF base para copiar páginas
      const plantillaBase = await PDFDocument.load(pdfBytes);

      // 🔹 Colores
      const headerColor = rgb(54 / 255, 4 / 255, 78 / 255);
      const cellBgColor = rgb(1, 1, 1);
      const textColor = rgb(0, 0, 0);
      const headerTextColor = rgb(1, 1, 1);

      // 🔹 Dimensiones y márgenes
      const pageWidth = pdfDoc.getPage(0).getWidth();
      const pageHeight = pdfDoc.getPage(0).getHeight();
      const marginSuperior = 40;
      const marginInferior = 40;
      const marginX = 40;
      const usableWidth = pageWidth - marginX * 2;
      const yInicial = pageHeight - marginSuperior;

      // 🔹 Página inicial
      let page = pdfDoc.getPage(0);
      let y = yInicial;
      const baseRowHeight = 12;
      const fontSize = 6;

      // ===== 1️⃣ Título y fecha =====
      const title = "Inventario de equipos";
      const titleWidth = boldFont.widthOfTextAtSize(title, 16);
      page.drawText(title, {
        x: (pageWidth - titleWidth) / 2,
        y,
        size: 16,
        font: boldFont,
        color: textColor,
      });
      y -= 25;

      const fecha = new Date().toLocaleString();
      page.drawText("Fecha de reporte: ", {
        x: marginX,
        y,
        size: 8,
        font: boldFont,
        color: textColor,
      });
      page.drawText(fecha, {
        x: marginX + boldFont.widthOfTextAtSize("Fecha de reporte: ", 8),
        y,
        size: 8,
        font,
        color: textColor,
      });
      y -= 15;

      // ===== 2️⃣ Función para dividir texto en líneas =====
      const splitTextToLines = (text, width, font, fontSize) => {
        if (!text) return [""];
        const parts = text.split("/");
        const lines = [];
        parts.forEach((part, index) => {
          let currentLine = part.trim();
          if (index < parts.length - 1) currentLine += "/";
          let tempLine = "";
          for (let i = 0; i < currentLine.length; i++) {
            const testLine = tempLine + currentLine[i];
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);
            if (textWidth > width - 4) {
              lines.push(tempLine.trimEnd() + "-");
              tempLine = currentLine[i];
            } else {
              tempLine = testLine;
            }
          }
          if (tempLine) lines.push(tempLine);
        });
        return lines;
      };

      // ===== 3️⃣ Agrupar registros por cliente =====
      const registrosPorCliente = whichInfo.reduce((acc, item) => {
        const clienteId = item.usuario_id;
        if (!acc[clienteId]) acc[clienteId] = [];
        acc[clienteId].push(item);
        return acc;
      }, {});

      // ===== 4️⃣ Dibujar tablas por cliente =====
      for (const clienteId in registrosPorCliente) {
        const clienteRegistros = registrosPorCliente[clienteId];

        const clienteNombre =
          opcionesClientes.find(
            (c) => c.value === clienteRegistros[0].usuario_id
          )?.label || clienteRegistros[0].usuario_id;

        // Cliente
        page.drawText("Cliente: ", {
          x: marginX,
          y,
          size: 8,
          font: boldFont,
          color: textColor,
        });
        page.drawText(clienteNombre, {
          x: marginX + boldFont.widthOfTextAtSize("Cliente: ", 8),
          y,
          size: 8,
          font,
          color: textColor,
        });
        y -= 15;

        // Encabezados dinámicos SOLO para este cliente
        const allKeysCliente = new Set();
        allKeysCliente.add("#");
        clienteRegistros.forEach((item) => {
          item.datos.forEach((detalle) => {
            Object.keys(detalle).forEach((k) => allKeysCliente.add(k));
          });
        });
        const headers = Array.from(allKeysCliente);

        const fixedHashWidth = 40;
        const remainingCols = headers.length - 1;
        const otherColWidth = (usableWidth - fixedHashWidth) / remainingCols;
        const getColWidth = (header) =>
          header === "#" ? fixedHashWidth : otherColWidth;

        // Dibujar encabezado
        let xPos = marginX;
        let headerMaxLines = 1;
        const headerLines = headers.map((header) => {
          const colWidth = getColWidth(header);
          const lines = splitTextToLines(header, colWidth, boldFont, fontSize);
          if (lines.length > headerMaxLines) headerMaxLines = lines.length;
          return lines;
        });
        const headerHeight = baseRowHeight * headerMaxLines;

        headers.forEach((header, i) => {
          const colWidth = getColWidth(header);
          page.drawRectangle({
            x: xPos,
            y: y - headerHeight,
            width: colWidth,
            height: headerHeight,
            color: headerColor,
            borderColor: headerColor,
            borderWidth: 0.5,
          });

          const lines = headerLines[i];
          let textY = y - 10;
          lines.forEach((line) => {
            const textWidth = boldFont.widthOfTextAtSize(line, fontSize);
            const centeredX = xPos + (colWidth - textWidth) / 2;
            page.drawText(line, {
              x: centeredX,
              y: textY,
              size: fontSize,
              font: boldFont,
              color: headerTextColor,
            });
            textY -= baseRowHeight;
          });
          xPos += colWidth;
        });

        y -= headerHeight;

        // Dibujar filas
        for (const item of clienteRegistros) {
          for (const detalle of item.datos) {
            const row = { "#": `°${item.info_id}`, ...detalle };
            const cellLines = {};
            let maxLines = 1;

            headers.forEach((h) => {
              const colWidth = getColWidth(h);
              const value = String(row[h] ?? "");
              const lines = splitTextToLines(value, colWidth, font, fontSize);
              cellLines[h] = lines;
              if (lines.length > maxLines) maxLines = lines.length;
            });

            const adjustedHeight = baseRowHeight * maxLines;

            // Dibujar celdas
            xPos = marginX;
            headers.forEach((h) => {
              const colWidth = getColWidth(h);
              page.drawRectangle({
                x: xPos,
                y: y - adjustedHeight,
                width: colWidth,
                height: adjustedHeight,
                color: cellBgColor,
                borderColor: headerColor,
                borderWidth: 0.5,
                opacity: 0.7,
              });
              xPos += colWidth;
            });

            // Dibujar texto
            xPos = marginX;
            headers.forEach((h) => {
              const lines = cellLines[h];
              let textY = y - 10;
              lines.forEach((line) => {
                page.drawText(line, {
                  x: xPos + 3,
                  y: textY,
                  size: fontSize,
                  font,
                  color: textColor,
                });
                textY -= baseRowHeight;
              });
              xPos += getColWidth(h);
            });

            y -= adjustedHeight;

            // Nueva página si se llena
            if (y - adjustedHeight < marginInferior) {
              const [newPage] = await pdfDoc.copyPages(plantillaBase, [0]);
              page = newPage;
              pdfDoc.addPage(page);
              y = yInicial;
            }
          }
        }

        y -= 20; // espacio entre clientes
      }

      // Guardar PDF
      const pdfBytesOut = await pdfDoc.save();
      const blob = new Blob([pdfBytesOut], { type: "application/pdf" });
      saveAs(blob, `inventario de equipos ${fecha}.pdf`);
    } catch (error) {
      console.error("Error exportando PDF:", error);
    }
  };


  // Exportar como excell
  const exportarExcell = async () => {
    try {
      // 🔹 1. Reunir todas las claves de manera dinámica
      const allKeys = new Set();

      whichInfo.forEach((item) => {
        allKeys.add("# Registro");
        allKeys.add("Cliente");

        item.datos.forEach((detalle) => {
          Object.keys(detalle).forEach((k) => allKeys.add(k));
        });
      });

      const headers = Array.from(allKeys);

      // 🔹 2. Crear workbook y worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Informe");

      // Definir columnas dinámicamente
      worksheet.columns = headers.map((h) => ({
        header: h,
        key: h,
        width: Math.max(h.length + 5, 15),
      }));

      // 🔹 3. Agregar filas
      whichInfo.forEach((item) => {
        const clienteNombre =
          opcionesClientes.find((c) => c.value === item.usuario_id)?.label ||
          item.usuario_id;

        item.datos.forEach((detalle) => {
          const row = {
            "# Registro": `°${item.info_id}`,
            Cliente: clienteNombre,
            ...detalle,
          };
          worksheet.addRow(row);
        });
      });

      // 🔹 4. Dar estilo a los encabezados
      worksheet.getRow(1).font = { bold: true };

      // 🔹 5. Alinear columna "# Registro" a la izquierda
      worksheet.getColumn("# Registro").alignment = { horizontal: "left" };

      // 🔹 6. Exportar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `inventario de equipos ${new Date().toLocaleString()}.xlsx`);
    } catch (error) {
      console.error("Error exportando Excel:", error);
    }
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
        .filter((c) => c.verificado === 1) // solo clientes verificados
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
    const response = await actualizarUsuario(
      usuarioSeleccionado.id,
      data.password
    );
    if (response.success) {
      toast.success("Contraseña cambiada con exito");
      setUsuarioSeleccionado(null);
      setPopUpEditarContrasena(false);
    } else {
      toast.error(response.error);
      return;
    }
  };
  // ? <- Fin editar cliente/acciones

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio eliminar cliente/acciones
  const { eliminarUsuario } = useUsuarioService();
  const eliminarCliente = async (cliente) => {
    // Mostramos el confirmador
    const result = await Swal.fire({
      title: `¿Eliminar cliente ${cliente.nombre}?`,
      text: "Esta acción es irreversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      // Si el usuario confirma, eliminamos el cliente
      const response = await eliminarUsuario(cliente.id);

      if (response.success) {
        toast.success(`Cliente ${cliente.nombre} eliminado`);
        obtenerClientes();
        if (clienteSeleccionado?.id === cliente.id) {
          setClienteSeleccionado(null);
        }
      } else {
        toast.error(response.error || "No se pudo eliminar el cliente");
      }
    }
  };
  // ? <- Fin eliminar cliente/acciones

  // Todo Funciones section

  // ? -> Inicio ver info cliente
  const { obtenerInformacion } = useInfoUsuarioService();
  const [whichInfo, setWhichInfo] = useState([]);
  const refInformacion = useRef(null);
  const cargarInformacion = async () => {
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
  const filtroInformacion = () => {
    const dato = refDato.current.value.trim().toLowerCase();
    const detalle = refDetalle.current.value.trim().toLowerCase();

    setTerminosBusqueda({ dato, detalle });

    // Si no hay filtros, retorna todo
    if (!dato && !detalle) {
      setWhichInfo(refInformacion.current);
      setIsDatoValue(false);
      setIsDetalleValue(false);
      return;
    }

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

    const filtrados = refInformacion.current.filter((info) => {
      const dataObj = info.datos[0] || {}; // extraemos el primer objeto de datos
      const keys = Object.keys(dataObj);

      // Filtrado por clave (dato)
      const datoMatch = dato
        ? keys.some((k) => k.toLowerCase().includes(dato))
        : true;

      // Filtrado por valor (detalle)
      const detalleMatch = detalle
        ? keys.some((k) => String(dataObj[k]).toLowerCase().includes(detalle))
        : true;

      return datoMatch && detalleMatch;
    });

    setWhichInfo(filtrados);
  };
  // ? <- Fin ver info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio crear info cliente
  const [popUpCrearInfo, setPopUpCrearInfo] = useState(false);
  const [draftCrear, setDraftCrear] = useState([]);
  const camposObligatorios = [
    "Hostname",
    "Plataforma",
    "Marca/Modelo",
    "Tipo",
    "Firmware/Versión S.O",
    "Ubicación",
    "Licenciamiento",
  ];

  const { crearInformacion } = useInfoUsuarioService();

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
    if (draftCrear.length > 1) {
      const copy = [...draftCrear];
      copy.splice(index, 1);
      setDraftCrear(copy);
    }
  };

  // Agregar par nuevo
  const scrollCrearRef = useRef(null);
  const inputCrearRef = useRef(null);
  const agregarDatoCrear = () => {
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

    const response = await crearInformacion(nuevaInfo);

    if (response.success) {
      toast.success(`Información creada con éxito`);
      cargarInformacion();
      setPopUpCrearInfo(false);
    } else {
      toast.error(response.error);
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
      setDraftDatos(entries);
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
    const copy = [...draftDatos];
    copy.splice(index, 1);
    setDraftDatos(copy);
  };

  // Agregar par nuevo
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const agregarDatoDraft = () => {
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

    // 🔹 Validar que no haya emojis en keys ni values
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

    // 🔹 Validar duplicados (ignorando mayúsculas/minúsculas)
    const keys = cleanedDraft.map((d) => d.key.trim());
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

    // 🔹 Convertir a objeto limpio
    const obj = cleanedDraft.reduce((acc, { key, value }) => {
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
    const response = await actualizarInformacion(infoActualizada);
    if (response.success) {
      toast.success(`Información °${infoActualizada.info_id} actualizada`);
      cargarInformacion();
      setPopUpEditarInfo(false);
    } else {
      toast.error(response.error);
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
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      // Crear objeto con solo las propiedades necesarias
      const infoEliminar = {
        info_id: info.info_id,
        usuario_id: info.usuario_id,
      };

      const response = await eliminarInformacion(infoEliminar);
      if (response.success) {
        toast.success(`Información °${info.info_id} eliminada`);
        cargarInformacion();
      } else {
        toast.error(response.error);
      }
    }
  };
  // ? <- Fin eliminar informacion cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio logout/acciones
  // Cerrar sesion
  const { logout } = useAuth();
  const cerrarSesion = async () => {
    const result = await Swal.fire({
      title: "¿Estas seguro de cerrar sesión?",
      text: "Tendrás que iniciar sesion nuevamente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Salir",
      cancelButtonText: "No, Volver",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      setTimeout(() => {
        logout();
      }, 150);
    }
  };
  // ? <- Fin logout/acciones

  return (
    <>
      {/* Nav */}
      <Nav>
        <button
          onClick={() => {
            obtenerClientes();
            setPopUpUsuarios(true);
          }}
          className="btn-nav"
          title="Gestión Usuarios"
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
          }}
          className={`btn-nav ${!clienteSeleccionado ? "btn-disabled" : ""}`}
          title="Restablecer cliente seleccionado"
          disabled={!clienteSeleccionado}
        >
          <img src={imgLimpiar} alt="" />
        </button>
        <button
          className={`btn-nav ${!clienteSeleccionado ? "btn-disabled" : ""}`}
          title="Crear registro"
          disabled={!clienteSeleccionado}
          onClick={() => {
            setDraftCrear([
              { key: "Hostname", value: "" },
              { key: "Plataforma", value: "" },
              { key: "Marca/Modelo", value: "" },
              { key: "Tipo", value: "" },
              { key: "Firmware/Versión S.O", value: "" },
              { key: "Ubicación", value: "" },
              { key: "Licenciamiento", value: "" },
            ]);

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
          onClick={() => exportarPDF()}
          className="btn-nav"
          title="Exportar a pdf"
        >
          <img src={imgPdf} alt="" />
        </button>
        <button
          onClick={() => exportarExcell()}
          className="btn-nav"
          title="Exportar a excel"
        >
          <img src={imgExcell} alt="" />
        </button>
        <div className="cont-cant-resultados">
          <span>{whichInfo.length} Resultados</span>
        </div>
        <button
          onClick={cerrarSesion}
          className="btn-nav"
          title="Cerrar sesión"
        >
          <img src={imgSalir} alt="" />
        </button>
      </Nav>
      <SepHrz />

      {/* Contenido principal */}
      <section>
        {[0, 1].map((col) => (
          <div key={col}>
            {whichInfo.map((info, index) =>
              index % 2 === col ? ( // cada item cae en su columna correspondiente
                <div className="item" key={info.info_id}>
                  <h3>
                    <button
                      onClick={() => {
                        setInfoSeleccionada(info);
                        setInfoAEditar({
                          ...info,
                          datos: info.datos.map((dato) => ({ ...dato })),
                        });
                        setPopUpEditarInfo(true);
                      }}
                    >
                      <img src={imgEditar} alt="" />
                    </button>
                    {`
                      ${
                        opcionesClientes.find(
                          (c) => c.value === info.usuario_id
                        )?.label
                      } - Registro °${info.info_id}
                    `}
                    <button onClick={() => eliminarInformacionCliente(info)}>
                      <img src={imgBorrar} alt="" />
                    </button>
                  </h3>
                  {info.datos.map((dato, i) => {
                    const entries = Object.entries(dato);
                    const mitad = Math.ceil(entries.length / 2);

                    const colIzq = entries.slice(0, mitad);
                    const colDer = entries.slice(mitad);

                    return (
                      <div className="cont-dato" key={i}>
                        <div className="columna">
                          {colIzq.map(([key, value]) => (
                            <p key={key}>
                              <strong>
                                {resaltarTexto(
                                  key,
                                  terminosBusqueda.dato,
                                  true
                                )}
                                :
                              </strong>{" "}
                              {resaltarTexto(
                                value,
                                terminosBusqueda.detalle,
                                false
                              )}
                            </p>
                          ))}
                        </div>
                        <div className="columna">
                          {colDer.map(([key, value]) => (
                            <p key={key}>
                              <strong>
                                {resaltarTexto(
                                  key,
                                  terminosBusqueda.dato,
                                  true
                                )}
                                :
                              </strong>{" "}
                              {resaltarTexto(
                                value,
                                terminosBusqueda.detalle,
                                false
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null
            )}
          </div>
        ))}
      </section>

      {/* PopUp usuarios */}
      <Popup
        open={popUpUsuarios}
        onClose={() => {
          setPopUpUsuarios(false);
          setUsuarioSeleccionado(null);
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>Gestión de usuarios</h2>
          <CardAdmin
            nameAdmin={user.nombre}
            rolAdmin={user.rol}
            onClick={() => {
              setPopUpEditarContrasena(true);
              setUsuarioSeleccionado(user);
            }}
          />
          <div className="cont-tb-usuarios">
            <div className="cont-search-new">
              <label className="cont-searcher">
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
              <label>Nombre:</label>
              {errorsCrear.nombre && <span>{errorsCrear.nombre.message}</span>}
            </div>
            <input
              type="text"
              {...registerCrear("nombre")}
              placeholder="alpina"
            />

            {/* Email */}
            <div className="cont-label">
              <label>Correo:</label>
              {errorsCrear.email && <span>{errorsCrear.email.message}</span>}
            </div>
            <input
              type="text"
              {...registerCrear("email")}
              placeholder="alpina@example.com"
            />

            {/* Password */}
            <div className="cont-label">
              <label>Contraseña:</label>
              {errorsCrear.password && (
                <span>{errorsCrear.password.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
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
              <label>Confirmar contraseña:</label>
              {errorsCrear.password2 && (
                <span>{errorsCrear.password2.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
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
            <button type="submit" disabled={isSubmittingCrear}>
              <img src={imgCrearCliente} alt="" />
              {isSubmittingCrear ? "Creando..." : "Crear"}
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
            Cambio contraseña
            <br />
            {usuarioSeleccionado?.nombre}
          </h2>
          <form onSubmit={handleSubmitCambiar(editarContraseña)}>
            {/* Password 1*/}
            <div className="cont-label">
              <label>Contraseña:</label>
              {errorsCambiar.password && (
                <span>{errorsCambiar.password.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
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
              <label>Confirmar contraseña:</label>
              {errorsCambiar.password2 && (
                <span>{errorsCambiar.password2.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
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
              className="btn-cambio-contraseña"
              type="submit"
              disabled={isSubmittingCambiar}
            >
              <img src={imgCandado} alt="" />
              {isSubmittingCambiar ? "Cambiando..." : "Cambiar"}
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
          <h2>
            {`${
              opcionesClientes.find(
                (c) => c.value === clienteSeleccionado?.value
              )?.label
            } - Nuevo registro`}
          </h2>

          <div ref={scrollCrearRef}>
            {draftCrear.map(({ key, value }, i, array) => {
              const esObligatorio = i < 7;

              return (
                <div key={i} className="cont-dato-editar">
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
                    <button type="button" onClick={() => eliminarDatoCrear(i)}>
                      <img src={imgBorrar} alt="Eliminar" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sep-hrz"></div>
          <div className="cont-btns">
            <button type="button" onClick={agregarDatoCrear}>
              <img src={imgAgregarFila} alt="" />
              Agregar campo
            </button>
            <button type="button" className="btn-crear" onClick={crearRegistro}>
              <img src={imgCrearRegistro} alt="" />
              Crear
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
              const esObligatorio = i < 7;

              return (
                <div key={i} className="cont-dato-editar">
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
                    <button type="button" onClick={() => eliminarDatoDraft(i)}>
                      <img src={imgBorrar} alt="Eliminar" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="sep-hrz"></div>
          <div className="cont-btns">
            <button type="button" onClick={agregarDatoDraft}>
              <img src={imgAgregarFila} alt="" />
              Agregar campo
            </button>
            <button type="button" onClick={editarRegistro}>
              <img src={imgEditar} alt="" />
              Guardar
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
