import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import { useAuth } from "../context/auth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);

      const from = location.state?.from?.pathname || "/";

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app">
      <Header />

      <section className="auth-section">
        <div className="auth-card">
          <span className="eyebrow">INGRESAR</span>
          <h2>Bienvenido de nuevo</h2>

          <form onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </label>

            <label className="form-field">
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={submitting}>
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="auth-switch">
            ¿No tenés cuenta?{" "}
            <Link to="/register">Creá una</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
