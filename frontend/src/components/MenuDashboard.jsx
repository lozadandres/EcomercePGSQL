import { useRef } from "react";
import { Link } from "react-router-dom";


const MenuDashboard = ({ menuOpen, setMenuOpen }) => {
  const menuDashboardRef = useRef(null);
  // const iconoMenuRef = useRef(null);

  // Cerrar menú al dar click en un enlace
  const handleEnlaceClick = () => {
    setMenuOpen(false);
  };

  return (
    <div
      className={`menu-dashboard ${menuOpen ? "open" : ""}`}
      ref={menuDashboardRef}
    >
      <div className="top-menu">
        <h2 className="logo">Admin<span className="danger">.</span></h2>
      </div>

      <div className="input-search">
        <i className="bx bx-search-alt"></i>
        <input type="text" className="input" placeholder="Buscar" />
      </div>

      <div className="menu">
        <Link to="/dashboard" className="enlace" onClick={handleEnlaceClick}>
          <i className="bx bxs-dashboard"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/dashboard/productos" className="enlace" onClick={handleEnlaceClick}>
          <i className="bx bx-box"></i>
          <span>Productos</span>
        </Link>
        <Link to="/dashboard/usuarios" className="enlace" onClick={handleEnlaceClick}>
          <i className="bx bx-user"></i>
          <span>Administrador</span>
        </Link>
        <Link to="/dashboard/categorias" className="enlace" onClick={handleEnlaceClick}>
          <i className="bx bx-category"></i>
          <span>Categorías</span>
        </Link>
        <div className="enlace" onClick={handleEnlaceClick}>
          <i className="bx bx-cog"></i>
          <span>Ajustes</span>
        </div>
      </div>
    </div>
  );
};

export default MenuDashboard;
