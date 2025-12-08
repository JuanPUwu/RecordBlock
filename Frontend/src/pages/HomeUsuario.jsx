// Estilos
import "../css/home.css";
import "../css/swalStyles.css";

// Hooks
import { useAuth } from "../context/AuthContext";

// Servicios
import { useUsuarioService } from "../services/usuarioService.js";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";

// Librerias
import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Popup from "reactjs-popup";
import toast from "react-hot-toast";

// Eschemas
import { schemaCambiarContraseña } from "../validations/eschemas";

// Utils
import { resaltarTexto } from "../utils/textUtils.jsx";
import { parseDateDMY } from "../utils/dateHelper.js";

// Componentes
import Nav from "../components/Nav.jsx";
import SepHrz from "../components/SepHrz.jsx";
import SearchNav from "../components/SearchNav.jsx";
import CardAdmin from "../components/CardAdmin.jsx";
import Spinner from "../components/Spinner.jsx";

// Imagenes
import imgSalir from "../assets/img/salir.webp";
import imgUsuario from "../assets/img/usuario.webp";
import imgVisibility from "../assets/img/ojo.webp";
import imgLimpiar from "../assets/img/reset.webp";
import imgCandado from "../assets/img/candado.webp";
import imgBorrar from "../assets/img/basura.webp";
import imgEditar from "../assets/img/editar.webp";
import imgAgregarFila from "../assets/img/agregarFila.webp";
import imgCrearRegistro from "../assets/img/flecha.webp";
import imgExcell from "../assets/img/excell.webp";
import imgPdf from "../assets/img/pdf.webp";
import imgVacio from "../assets/img/vacio.webp";

export default function HomeUsuario() {
  // Todo Funciones Nav

  // ? Inicio Manejo formularios ->
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

  const [verPassword, setVerPassword] = useState("password");
  const [verPassword2, setVerPassword2] = useState("password");

  const [isRefrescarInfo, setIsRefrescarInfo] = useState(false);
  function refrescarInfo() {
    setIsRefrescarInfo(true);
    cargarInformacion();
    toast.success("Registros refrescados");
    setTimeout(() => {
      setIsRefrescarInfo(false);
    }, 300);
  }

  const [isLoading, setIsLoading] = useState(false);

  const [isInfoCargando, setIsInfoCargando] = useState(true);
  // ? <- Fin utils

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
      return;
    }
  };
  // ? <- Fin editar cliente/acciones

  // * <-------------------------------------------------------------------------------->

  // Todo Funciones section

  // ? -> Inicio ver info cliente
  const { obtenerInformacion } = useInfoUsuarioService();
  const [whichInfo, setWhichInfo] = useState([]);
  const refInformacion = useRef(null);
  const cargarInformacion = async () => {
    setIsInfoCargando(true);
    const response = await obtenerInformacion(user?.value);
    refInformacion.current = response.data.data;
    filtroInformacion();
  };

  useEffect(() => {
    cargarInformacion();
  }, []);

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
      setIsInfoCargando(false);
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

    setWhichInfo(filtrados);
    setIsInfoCargando(false);
  };
  // ? <- Fin ver info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio crear info cliente
  const [popUpCrearInfo, setPopUpCrearInfo] = useState(false);
  const [draftCrear, setDraftCrear] = useState([]);

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
      usuario_id: user.id,
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
    setIsLoading(true);
    const { default: Swal } = await import("sweetalert2");
    const { default: swalStyles } = await import("../css/swalStyles.js");
    setIsLoading(false);

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

  // ? -> Inicio logout/acciones
  // Cerrar sesion
  const { logout } = useAuth();
  const cerrarSesion = async () => {
    setIsLoading(true);
    const { default: Swal } = await import("sweetalert2");
    const { default: swalStyles } = await import("../css/swalStyles.js");
    setIsLoading(false);

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

  return (
    <>
      {/* Loader */}
      {isLoading && <Spinner />}

      {/* Nav */}
      <Nav>
        <button
          onClick={() => {
            setPopUpUsuarios(true);
          }}
          className="btn-nav btn-user"
          title="Gestión de usuario"
        >
          <img src={imgUsuario} alt="" />
          <span>{user.nombre}</span>
        </button>
        <button
          onClick={() => refrescarInfo()}
          className={`btn-nav ${isRefrescarInfo ? "btn-disabled" : ""}`}
          disabled={isRefrescarInfo}
          title="Refrescar registros"
        >
          <img src={imgLimpiar} alt="" />
        </button>
        <button
          className="btn-nav"
          title="Crear registro"
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
          onClick={() => exportarComoPDF()}
          className="btn-nav"
          title="Exportar a pdf"
        >
          <img src={imgPdf} alt="" />
        </button>
        <button
          onClick={() => exportarComoExcell()}
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
        {isInfoCargando ? (
          <div className="loader section"></div>
        ) : whichInfo.length === 0 ? (
          <div className="cont-sin-resultados">
            <img src={imgVacio} alt="" />
            <span>No se encontraron resultados</span>
          </div>
        ) : (
          [0, 1].map((col) => (
            <div key={col}>
              {whichInfo.map((info, index) =>
                index % 2 === col ? (
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
                      {`Registro °${info.info_id}`}
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
          ))
        )}
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
          <h2>Gestión de usuario</h2>
          <CardAdmin
            nameAdmin={user.nombre}
            isAdmin={user.isAdmin}
            onClick={() => {
              setPopUpEditarContrasena(true);
              setUsuarioSeleccionado(user);
            }}
          />
          <input className="inp-hiden" />
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
          <h2>Cambio de contraseña</h2>
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
              title="Cambiar contraseña"
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
          <h2>Nuevo registro</h2>
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
              Agregar campo
            </button>
            <button
              type="button"
              className="btn-crear"
              onClick={crearRegistro}
              title="Crear registro"
            >
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
          <h2>{`Registro °${infoAEditar?.info_id}`}</h2>

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
              Agregar campo
            </button>
            <button
              type="button"
              onClick={editarRegistro}
              title="Guardar registro"
            >
              <img src={imgEditar} alt="" />
              Guardar
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
