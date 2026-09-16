import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../components/Header";
import Stars from "../components/Stars";
import {
  apiFetch,
  getRecipePuntaje,
  setRecipePuntaje,
  uploadRecipePhoto,
} from "../api";
import { useAuth } from "../context/auth";

function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [miPuntaje, setMiPuntaje] = useState(null);
  const [ratingSaving, setRatingSaving] = useState(false);

  useEffect(() => {
    const getRecipe = async () => {
      try {
        const response = await apiFetch(
          `/recipes/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "No se pudo obtener la receta"
          );
        }

        const data = await response.json();

        setRecipe(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getRecipe();
  }, [id]);

  useEffect(() => {
    if (!recipe || !user) {
      return;
    }

    let active = true;

    const loadMine = async () => {
      try {
        const data = await getRecipePuntaje(id);

        if (active) {
          setMiPuntaje(data.mi_puntaje);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadMine();

    return () => {
      active = false;
    };
  }, [id, user, recipe]);

  const isOwner = Boolean(
    recipe &&
      user &&
      String(recipe.user_id) === String(user.id)
  );

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const response = await uploadRecipePhoto(id, file);

      if (!response.ok) {
        throw new Error("No se pudo subir la foto");
      }

      setRecipe(await response.json());
    } catch (error) {
      console.error(error);
      alert(
        "No se pudo subir la foto. Probá con otra imagen."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const rateRecipe = async (puntaje) => {
    if (ratingSaving) return;

    setRatingSaving(true);

    try {
      const response = await setRecipePuntaje(id, puntaje);

      if (!response.ok) {
        throw new Error("No se pudo guardar el puntaje");
      }

      const updated = await response.json();

      setRecipe((current) => ({
        ...current,
        puntaje: updated.puntaje,
      }));

      setMiPuntaje(puntaje);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar tu puntaje. Probá de nuevo.");
    } finally {
      setRatingSaving(false);
    }
  };

  if (loading) {
    return <p>Cargando receta...</p>;
  }

  if (!recipe) {
    return (
      <main className="app">
        <p>No se encontró la receta.</p>

        <Link to="/explorar">
          ← Volver a explorar
        </Link>
      </main>
    );
  }

  return (
    <main className="app">
      <Header />

      <section className="recipe-detail">
        <Link to="/explorar" className="back-button">
          ← Volver a explorar
        </Link>

        <span className="eyebrow">
          RECETA
        </span>

        <h2>{recipe.title}</h2>

        {recipe.description && (
          <p>{recipe.description}</p>
        )}

        {recipe.image_url ? (
          <img
            className="photo-large"
            src={recipe.image_url}
            alt={recipe.title}
          />
        ) : (
          <div className="photo-empty-large">
            Aún no tiene foto
          </div>
        )}

        {isOwner && (
          <>
            <p className="photo-note">
              La foto es opcional, pero es lindo mirar cómo
              queda tu receta.
            </p>

            <label
              className={`photo-input${
                uploading ? " photo-input-disabled" : ""
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={uploading}
              />
              {uploading
                ? "Subiendo foto..."
                : recipe.image_url
                  ? "Cambiar foto"
                  : "Subir foto"}
            </label>
          </>
        )}

        <div className="rating-block">
          <span className="eyebrow">PUNTAJE</span>

          <div className="rating-average">
            {recipe.puntaje
              ? (
                  <>
                    <Stars value={recipe.puntaje} />

                    <span className="rating-value">
                      {String(recipe.puntaje).replace(
                        ".",
                        ","
                      )}
                    </span>
                  </>
                )
              : (
                  <>
                    <Stars value={0} />

                    <span className="rating-value">
                      Sin puntaje todavía
                    </span>
                  </>
                )}
          </div>

          {user ? (
            <div className="rating-mine">
              <span>Tu puntaje:</span>

              <Stars
                value={miPuntaje || 0}
                interactive
                onChange={rateRecipe}
              />

              {miPuntaje ? (
                <span className="rating-value">
                  {String(miPuntaje).replace(".", ",")}
                </span>
              ) : null}

              {ratingSaving && (
                <span className="rating-value">
                  Guardando...
                </span>
              )}
            </div>
          ) : (
            <p className="photo-note">
              <Link to="/login">Iniciá sesión</Link>{" "}
              para puntuar esta receta.
            </p>
          )}
        </div>

        <h4>Ingredientes</h4>

        <ul>
          {recipe.ingredients.map(
            (ingredient, index) => (
              <li key={index}>
                {ingredient}
              </li>
            )
          )}
        </ul>

        <h4>Preparación</h4>

        <ol>
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>

        {recipe.preparation_time && (
          <>
            <h4>Tiempo</h4>
            <p>{recipe.preparation_time}</p>
          </>
        )}

        {recipe.servings && (
          <>
            <h4>Porciones</h4>
            <p>{recipe.servings}</p>
          </>
        )}

        {recipe.tips &&
          recipe.tips.length > 0 && (
            <>
              <h4>Consejos</h4>

              <ul>
                {recipe.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </>
          )}
      </section>
    </main>
  );
}

export default RecipeDetail;