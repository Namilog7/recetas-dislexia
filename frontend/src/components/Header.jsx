import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/auth";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <h1>🍴 Recetas fáciles</h1>

      <nav>
        {user ? (
          <>
            <Link to="/">Crear</Link>
            <Link to="/recetas">Mis recetas</Link>
            <Link to="/explorar">Explorar</Link>
            <span className="nav-user">
              {user.name || user.email}
            </span>
            <button
              type="button"
              className="nav-button"
              onClick={handleLogout}
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/explorar">Explorar</Link>
            <Link to="/login">Ingresar</Link>
            <Link to="/register">Crear cuenta</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
