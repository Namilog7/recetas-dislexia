import { useEffect, useState } from "react";

import Header from "../components/Header";
import { apiFetch, uploadRecipePhoto } from "../api";

function Home() {
  const [text, setText] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  const processRecipe = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setRecipe(null);

    try {
      const response = await apiFetch(
        "/recipes/process",
        {
          method: "POST",
          body: JSON.stringify({
            text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo procesar la receta");
      }

      const data = await response.json();

      setRecipe(data);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al procesar la receta.");
    } finally {
      setLoading(false);
    }
  };

  const updateRecipeField = (field, value) => {
    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      [field]: value,
    }));
  };

  const updateRecipeItem = (field, index, value) => {
    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      [field]: currentRecipe[field].map(
        (item, itemIndex) =>
          itemIndex === index ? value : item
      ),
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }

    setPhoto(file);
    setPhotoUrl(file ? URL.createObjectURL(file) : null);
  };

  const removePhoto = () => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }

    setPhoto(null);
    setPhotoUrl(null);
  };

  const saveRecipe = async () => {
    if (!recipe) return;

    setSaving(true);

    try {
      const response = await apiFetch("/recipes/", {
        method: "POST",
        body: JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          original_text: text,
          preparation_time: recipe.preparation_time,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          tips: recipe.tips,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la receta");
      }

      const savedRecipe = await response.json();

      if (photo) {
        const uploadResponse = await uploadRecipePhoto(
          savedRecipe.id,
          photo
        );

        alert(
          uploadResponse.ok
            ? "¡Receta guardada correctamente con su foto!"
            : "Receta guardada, pero no se pudo subir la foto. Podés intentarlo luego desde la receta."
        );
      } else {
        alert(
          "¡Receta guardada correctamente! Podés agregarle una foto cuando quieras."
        );
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar la receta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="app">
      <Header />

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            RECETAS A TU MANERA
          </span>

          <h2>
            Escribí tu receta
            <br />
            como quieras.
          </h2>

          <p>
            No hace falta que la ordenes ni que completes
            formularios. Escribila como te salga y nosotros
            nos encargamos de organizarla.
          </p>

          <div className="recipe-input">
            <label htmlFor="recipe">
              Contanos cómo preparás tu receta
            </label>

            <textarea
              id="recipe"
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder="Ejemplo: ayer hice tortas fritas, usé medio kilo de harina..."
              disabled={loading}
            />

            <div className="input-footer">
              <span>
                {text.length} caracteres
              </span>

              <button
                onClick={processRecipe}
                disabled={!text.trim() || loading}
              >
                {loading
                  ? "Organizando..."
                  : "✨ Organizar receta"}
              </button>
            </div>
          </div>

          {recipe && (
            <section className="recipe-result">
              <span className="eyebrow">
                RECETA ORGANIZADA
              </span>

              <input
                value={recipe.title}
                onChange={(event) =>
                  updateRecipeField(
                    "title",
                    event.target.value
                  )
                }
              />

              {recipe.description !== null && (
                <textarea
                  value={recipe.description}
                  onChange={(event) =>
                    updateRecipeField(
                      "description",
                      event.target.value
                    )
                  }
                />
              )}

              <h4>Ingredientes</h4>

              <div className="editable-list">
                {recipe.ingredients.map(
                  (ingredient, index) => (
                    <input
                      key={index}
                      value={ingredient}
                      onChange={(event) =>
                        updateRecipeItem(
                          "ingredients",
                          index,
                          event.target.value
                        )
                      }
                    />
                  )
                )}
              </div>

              <h4>Preparación</h4>

              <div className="editable-list">
                {recipe.steps.map((step, index) => (
                  <textarea
                    key={index}
                    value={step}
                    onChange={(event) =>
                      updateRecipeItem(
                        "steps",
                        index,
                        event.target.value
                      )
                    }
                  />
                ))}
              </div>

              <h4>Tiempo</h4>

              <input
                value={recipe.preparation_time ?? ""}
                onChange={(event) =>
                  updateRecipeField(
                    "preparation_time",
                    event.target.value
                  )
                }
              />

              <h4>Porciones</h4>

              <input
                type="number"
                value={recipe.servings ?? ""}
                onChange={(event) =>
                  updateRecipeField(
                    "servings",
                    event.target.value
                      ? Number(event.target.value)
                      : null
                  )
                }
              />

              {recipe.tips &&
                recipe.tips.length > 0 && (
                  <>
                    <h4>Consejos</h4>

                    <div className="editable-list">
                      {recipe.tips.map(
                        (tip, index) => (
                          <input
                            key={index}
                            value={tip}
                            onChange={(event) =>
                              updateRecipeItem(
                                "tips",
                                index,
                                event.target.value
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  </>
                )}

              <h4>Foto (opcional)</h4>

              <p className="photo-note">
                No es obligatoria, pero es lindo mirar cómo
                queda tu receta. Podés subirla ahora o
                hacerlo más tarde.
              </p>

              {photoUrl ? (
                <img
                  className="photo-preview"
                  src={photoUrl}
                  alt="Vista previa de la receta"
                />
              ) : (
                <div className="photo-empty">
                  Sin foto todavía
                </div>
              )}

              <label className="photo-input">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {photo ? "Cambiar foto" : "Elegir foto"}
              </label>

              {photo && (
                <button
                  type="button"
                  className="photo-remove"
                  onClick={removePhoto}
                >
                  Quitar foto
                </button>
              )}

              <button
                onClick={saveRecipe}
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : "💾 Guardar receta"}
              </button>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;