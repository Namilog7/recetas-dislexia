import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tema, setTema] = useState(() => localStorage.getItem("tema") || "claro");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <h1>🍴 Recetas fáciles</h1>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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

        <div style={{ display: 'flex', gap: '5px', marginLeft: '15px' }}>
          <button onClick={() => setTema('claro')} title="Tema Claro" style={{ padding: '5px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>☀️</button>
          <button onClick={() => setTema('oscuro')} title="Tema Oscuro" style={{ padding: '5px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>🌙</button>
          <button onClick={() => setTema('alto-contraste')} title="Alto Contraste" style={{ padding: '5px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>👁️</button>
        </div>
      </nav>
    </header>
  );
}

export default Header;