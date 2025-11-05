import "../css/card.css";

import imgLlave from "../assets/img/candado.webp";

export default function CardAdmin({ nameAdmin, rolAdmin, onClick }) {
  return (
    <div className="card-admin">
      <div>
        <span>{nameAdmin}</span>
        <span>{rolAdmin}</span>
      </div>
      <button onClick={onClick} title="Cambio contraseña">
        <img src={imgLlave} alt="" />
      </button>
    </div>
  );
}
