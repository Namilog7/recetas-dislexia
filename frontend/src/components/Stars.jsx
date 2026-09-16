import { useState } from "react";

function Stars({
  value = 0,
  interactive = false,
  onChange,
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const shown = interactive
    ? hoverValue || value || 0
    : value || 0;

  const fillPercent =
    Math.round(
      Math.max(0, Math.min(1, shown / 5)) * 100 * 10
    ) / 10;

  return (
    <div
      className={`stars${
        interactive ? " stars-interactive" : ""
      }`}
      onMouseLeave={() => setHoverValue(0)}
    >
      <div className="stars-track">
        <div className="stars-row">
          {[...Array(5)].map((_, index) => (
            <span key={index} className="star">
              ★
            </span>
          ))}
        </div>

        <div
          className="stars-fill"
          style={{ width: `${fillPercent}%` }}
        >
          <div className="stars-row">
            {[...Array(5)].map((_, index) => (
              <span key={index} className="star">
                ★
              </span>
            ))}
          </div>
        </div>

        {interactive && (
          <div className="stars-hit">
            {[...Array(5)].map((_, index) => {
              const star = index + 1;

              return (
                <span key={index} className="star-hit">
                  {index > 0 && (
                    <button
                      type="button"
                      className="star-hit-half"
                      onMouseEnter={() =>
                        setHoverValue(star - 0.5)
                      }
                      onClick={() => onChange(star - 0.5)}
                      aria-label={`Puntuar ${star - 0.5}`}
                    />
                  )}

                  <button
                    type="button"
                    className="star-hit-half"
                    onMouseEnter={() =>
                      setHoverValue(star)
                    }
                    onClick={() => onChange(star)}
                    aria-label={`Puntuar ${star}`}
                  />
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Stars;