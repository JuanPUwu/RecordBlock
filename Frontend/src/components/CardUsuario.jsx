import "../css/card.css";

import imgLlave from "../assets/img/candado.png";
import imgBorrar from "../assets/img/eliminar.png";

export default function CardUsuario({
  nameUsuario,
  correoUsuario,
  onClick1,
  onClick2,
}) {
  return (
    <div className="card-usuario">
      <div>
        <span>{nameUsuario}</span>
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
