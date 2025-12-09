import "../css/spinner.css";
import Popup from "reactjs-popup";
import { useState } from "react";

export default function SpinnerPages() {
  const [open] = useState(true);

  return (
    <Popup
      open={open}
      closeOnDocumentClick={false}
      closeOnEscape={false}
      modal
      nested
      lockScroll={false}
      overlayStyle={{
        background: "rgba(189, 189, 189)",
      }}
    >
      <div className="cont-popUp cont-spinner">
        <div className="loader"></div>
        <button className="btn-hiden" type="button"></button>
      </div>
    </Popup>
  );
}
