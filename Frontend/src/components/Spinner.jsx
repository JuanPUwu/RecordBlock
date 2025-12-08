import "../css/spinner.css";
import Popup from "reactjs-popup";
import { useState } from "react";

export default function Spinner() {
  const [open, setOpen] = useState(true);

  return (
    <Popup
      open={open}
      closeOnDocumentClick={false}
      closeOnEscape={false}
      modal
      nested
      lockScroll={false}
    >
      <div className="cont-popUp cont-spinner">
        <div className="loader"></div>
        <button className="btn-hiden" type="button"></button>
      </div>
    </Popup>
  );
}

Spinner.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
