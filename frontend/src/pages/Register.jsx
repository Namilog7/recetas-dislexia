import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import { useAuth } from "../context/auth";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({ name, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app">
      <Header />

      <section className="auth-section">
        <div className="auth-card">
          <span className="eyebrow">CREAR CUENTA</span>
          <h2>Empezá a guardar tus recetas</h2>

          <form onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Nombre (opcional)</span>
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
              />
            </label>

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
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={submitting}>
              {submitting ? "Creando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login">Ingresá</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
