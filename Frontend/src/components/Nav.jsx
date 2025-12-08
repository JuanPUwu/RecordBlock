import "../css/nav.css";
import PropTypes from "prop-types";

export default function Nav({ children }) {
  return <nav>{children}</nav>;
}

Nav.propTypes = {
  children: PropTypes.node.isRequired,
};
