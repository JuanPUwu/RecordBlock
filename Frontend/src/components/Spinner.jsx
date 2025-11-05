import "../css/spinner.css";
import Popup from "reactjs-popup";
import { useState, useEffect } from "react";

export default function Spinner() {
  const [open, setOpen] = useState(true);

  return (
    <Popup
      open={open}
      closeOnDocumentClick={false}
      closeOnEscape={false}
      modal
      nested
      lockScroll
    >
      <div className="cont-popUp cont-spinner">
        <div className="loader"></div>
        <button className="btn-hiden" type="button" aria-hidden="true"></button>
      </div>
    </Popup>
  );
}
