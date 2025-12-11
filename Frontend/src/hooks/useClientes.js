import { useState, useEffect, useRef } from "react";
import { useUsuarioService } from "../services/usuarioService.js";
import toast from "react-hot-toast";

export const useClientes = (isAdmin = false) => {
  const [clientes, setClientes] = useState([]);
  const [opcionesClientes, setOpcionesClientes] = useState([]);
  const [opcionesClientesTabla, setOpcionesClientesTabla] = useState([]);
  const [resultadosBusquedaClientes, setResultadosBusquedaClientes] = useState(
    []
  );
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const refBusquedaCliente = useRef();

  const { obtenerUsuarios } = useUsuarioService();

  const obtenerClientes = async () => {
    if (!isAdmin) {
      return;
    }
    
    const response = await obtenerUsuarios();
    
    if (!response.success || !response.data?.data) {
      return;
    }
    
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
    if (isAdmin) {
      obtenerClientes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

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

  const limpiarClienteSeleccionado = () => {
    setClienteSeleccionado(null);
    refBusquedaCliente.current.value = "";
    setResultadosBusquedaClientes([]);
    toast.success("Cliente restablecido");
  };

  return {
    clientes,
    opcionesClientes,
    opcionesClientesTabla,
    resultadosBusquedaClientes,
    clienteSeleccionado,
    setClienteSeleccionado,
    refBusquedaCliente,
    obtenerClientes,
    buscarCliente,
    buscarClienteTabla,
    seleccionBusqueda,
    limpiarClienteSeleccionado,
  };
};
