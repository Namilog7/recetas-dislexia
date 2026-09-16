import { useCallback, useEffect, useState } from "react";

import { apiFetch, clearToken, getToken, setToken } from "../api";
import { AuthContext } from "./auth";

async function fetchCurrentUser() {
  const response = await apiFetch("/auth/me");

  if (!response.ok) {
    throw new Error("Sesión no válida");
  }

  return response.json();
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        clearToken();

        if (active) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Email o contraseña incorrectos");
    }

    const data = await response.json();

    setToken(data.access_token);
    setTokenState(data.access_token);

    const currentUser = await fetchCurrentUser();
    setUser(currentUser);

    return currentUser;
  }, []);

  const register = useCallback(
    async ({ email, name, password }) => {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          name: name || null,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.detail || "No se pudo crear la cuenta"
        );
      }

      return login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
