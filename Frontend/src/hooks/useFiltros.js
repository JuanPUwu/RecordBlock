import { useState, useEffect, useRef } from "react";
import { parseDateDMY } from "../utils/dateHelper.js";
import { useDebounce } from "./useDebounce.js";

export const useFiltros = (refInformacion) => {
  const [terminosBusqueda, setTerminosBusqueda] = useState({
    dato: "",
    detalle: "",
  });
  const [filtrarPorFecha, setFiltrarPorFecha] = useState(false);
  const [isDatoValue, setIsDatoValue] = useState(false);
  const [isDetalleValue, setIsDetalleValue] = useState(false);
  const [whichInfo, setWhichInfo] = useState([]);
  const [isInfoCargando, setIsInfoCargando] = useState(true);
  const [valorDatoInput, setValorDatoInput] = useState("");
  const [valorDetalleInput, setValorDetalleInput] = useState("");

  const refDato = useRef();
  const refDetalle = useRef();
  const refFiltrarPorFecha = useRef(filtrarPorFecha);

  // Debounce de los valores de input
  const debouncedDato = useDebounce(valorDatoInput, 150);
  const debouncedDetalle = useDebounce(valorDetalleInput, 150);

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

  // Efecto para aplicar el filtro cuando cambian los valores debounced
  useEffect(() => {
    if (refDato.current) {
      refDato.current.value = debouncedDato;
    }
    if (refDetalle.current) {
      refDetalle.current.value = debouncedDetalle;
    }
    aplicarFiltro(debouncedDato, debouncedDetalle, filtrarPorFecha);
  }, [debouncedDato, debouncedDetalle, filtrarPorFecha]);

  const aplicarFiltro = (datoInput, detalleInput, valorCheckbox = null) => {
    // Si se pasa un valor explícito del checkbox (true o false), usarlo
    // Si se pasa null o undefined, usar el estado actual directamente (no el ref)
    // Esto asegura que siempre tengamos el valor más reciente del estado
    const debeFiltrarPorFecha =
      valorCheckbox === true || valorCheckbox === false
        ? valorCheckbox
        : filtrarPorFecha;

    const dato = datoInput.trim().toLowerCase();
    const detalle = detalleInput.trim().toLowerCase();

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

  const filtroInformacion = (valorCheckbox = null) => {
    // Obtener valores actuales de los inputs
    const valorDato = valorDatoInput || refDato.current?.value || "";
    const valorDetalle = valorDetalleInput || refDetalle.current?.value || "";
    aplicarFiltro(valorDato, valorDetalle, valorCheckbox);
  };

  const handleInputDato = (e) => {
    const nuevoValor = e.target.value;
    setValorDatoInput(nuevoValor);
  };

  const handleInputDetalle = (e) => {
    const nuevoValor = e.target.value;
    setValorDetalleInput(nuevoValor);
  };

  return {
    terminosBusqueda,
    filtrarPorFecha,
    setFiltrarPorFecha,
    isDatoValue,
    isDetalleValue,
    whichInfo,
    isInfoCargando,
    setIsInfoCargando,
    refDato,
    refDetalle,
    filtroInformacion,
    handleInputDato,
    handleInputDetalle,
  };
};
