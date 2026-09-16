import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import { apiFetch } from "../api";

const PAGE_SIZE = 9;

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const getRecipes = async () => {
      setLoading(true);

      try {
        const response = await apiFetch(
          `/recipes/?skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`
        );

        if (!response.ok) {
          throw new Error(
            "No se pudieron obtener las recetas"
          );
        }

        const data = await response.json();

        if (active) {
          setRecipes(data.items);
          setTotal(data.total);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    getRecipes();

    return () => {
      active = false;
    };
  }, [page]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  return (
    <main className="app">
      <Header />

      <section className="recipes-section">
        <div className="recipes-content">
          <span className="eyebrow">MIS RECETAS</span>

          <h2>Recetas guardadas</h2>

          {loading ? (
            <p>Cargando recetas...</p>
          ) : recipes.length === 0 ? (
            <p>
              Todavía no tenés recetas guardadas.{" "}
              <Link to="/">Creá una</Link>
            </p>
          ) : (
            <>
              <div className="recipes-list">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recetas/${recipe.id}`}
                    className="recipe-card"
                  >
                    {recipe.image_url && (
                      <img
                        className="recipe-thumb"
                        src={recipe.image_url}
                        alt={recipe.title}
                      />
                    )}

                    <h3>{recipe.title}</h3>

                    {recipe.description && (
                      <p>{recipe.description}</p>
                    )}

                    {recipe.servings && (
                      <span>
                        {recipe.servings} porciones
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.max(0, current - 1)
                      )
                    }
                    disabled={page === 0}
                  >
                    ← Anterior
                  </button>

                  <span>
                    Página {page + 1} de {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages - 1,
                          current + 1
                        )
                      )
                    }
                    disabled={page >= totalPages - 1}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default Recipes;