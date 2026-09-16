const API_URL = "http://localhost:8000";
const TOKEN_KEY = "recetas_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}

export async function uploadRecipePhoto(recipeId, file) {
  const formData = new FormData();
  formData.append("photo", file);

  const headers = {};

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}/recipes/${recipeId}/photo`, {
    method: "POST",
    headers,
    body: formData,
  });
}

export async function getRecipePuntaje(recipeId) {
  const response = await apiFetch(
    `/recipes/${recipeId}/puntaje`
  );

  return response.json();
}

export async function setRecipePuntaje(recipeId, puntaje) {
  return apiFetch(`/recipes/${recipeId}/puntaje`, {
    method: "POST",
    body: JSON.stringify({ puntaje }),
  });
}
