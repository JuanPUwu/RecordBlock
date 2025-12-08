import "../css/spinner.css";
import Popup from "reactjs-popup";
import { useState } from "react";
import PropTypes from "prop-types";

export default function SpinnerPages() {
  const [open, setOpen] = useState(true);

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

SpinnerPages.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
