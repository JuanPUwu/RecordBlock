import "../css/card.css";

import imgLlave from "../assets/img/candado.webp";
import imgBorrar from "../assets/img/eliminar.webp";

export default function CardUsuario({
  nameUsuario,
  correoUsuario,
  estado,
  onClick1,
  onClick2,
}) {
  return (
    <div className="card-usuario">
      <div>
        <span>{nameUsuario}</span>
        <span>{estado}</span>
        <span>{correoUsuario}</span>
      </div>
      <button onClick={onClick1} title="Cambio contraseña">
        <img src={imgLlave} alt="" />
      </button>
      <button onClick={onClick2} title="Eliminar usuario">
        <img src={imgBorrar} alt="" />
      </button>
    </div>
  );
}
