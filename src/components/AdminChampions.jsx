// src/components/AdminChampions.jsx
import React, { useEffect, useRef, useState } from "react";
import { getImageUrl } from "../lib/api";
import "./AdminChampions.css"; // reuse the same classes & look/feel

export default function AdminChampions() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingKey, setEditingKey] = useState(null); // prefer temp key if present
  const [draft, setDraft] = useState(null);

  const [previewURL, setPreviewURL] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef();

  const [newCount, setNewCount] = useState(0);

  // ──────────────────────────────────────────────────────────
  // Fetch champions on mount
  // GET /api/champions  → returns [] when empty
  // Treat 404 as empty list (in case server returns 404 for empty)
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch(`/api/champions`, { credentials: "include", cache: "no-store" })
      .then((res) => {
        if (res.status === 404) return []; // empty state, not an error
        if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.champions || [];
        const withKeys = list
          .map((c) => ({ ...c, cacheKey: Date.now() }))
          .sort((a, b) => Number(b.year) - Number(a.year)); // newest first
        setChampions(withKeys);
      })
      .catch((err) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  // ──────────────────────────────────────────────────────────
  // Add Champion → prepends a new editable placeholder
  // ──────────────────────────────────────────────────────────
  const handleAddChampion = () => {
    const tempId = `__new__${newCount + 1}`;
    setNewCount((n) => n + 1);

    const blank = {
      key: tempId, // keep a temp key so it remains "new" even if year is filled
      year: new Date().getFullYear(),
      player: "",
      thumbnail: "",
      cacheKey: Date.now(),
    };

    setChampions((prev) => [blank, ...prev]);
    setEditingKey(tempId);
    setDraft({ ...blank, _originalYear: blank.year });
    setImageFile(null);
    setPreviewURL(null);
  };

  // ──────────────────────────────────────────────────────────
  // Delete Champion
  // DELETE /api/champions/{year}
  // ──────────────────────────────────────────────────────────
  const handleDelete = (champ) => {
    const isNew =
      typeof champ.key === "string" && champ.key.startsWith("__new__");
    if (isNew) {
      setChampions((prev) => prev.filter((c) => c.key !== champ.key));
      return;
    }

    const confirmed = window.confirm(
      `Delete champion for ${champ.year} (${champ.player})?`,
    );
    if (!confirmed) return;

    fetch(`/api/champions/${champ.year}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(t || `HTTP ${res.status}`);
          });
        }
        setChampions((prev) => prev.filter((c) => c.year !== champ.year));
      })
      .catch((err) => window.alert(`Delete failed: ${err.message}`));
  };

  // ──────────────────────────────────────────────────────────
  // Save Champion (POST for new, PUT for edit)
  // POST   /api/champions                    body: FormData{ champion: JSON, image? }
  // PUT    /api/champions/{originalYear}     body: FormData{ champion: JSON, image? }
  // Image GET path (read-only mode): /api/champions/{year}/image
  // ──────────────────────────────────────────────────────────
  const handleSave = (isNew, originalYear) => {
    const form = new FormData();
    const payload = {
      year: String(draft.year || "").trim(),
      player: (draft.player || "").trim(),
    };
    if (!payload.year || !payload.player) {
      window.alert("Year and Player are required.");
      return;
    }
    form.append("champion", JSON.stringify(payload));
    if (imageFile) form.append("image", imageFile);

    const url = isNew ? `/api/champions` : `/api/champions/${originalYear}`;
    const method = isNew ? "POST" : "PUT";

    fetch(url, { method, credentials: "include", body: form })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(t || `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then((returned) => {
        setChampions((prev) => {
          if (isNew) {
            // remove placeholders and prepend real record
            const filtered = prev.filter(
              (c) =>
                !(typeof c.key === "string" && c.key.startsWith("__new__")),
            );
            return [{ ...returned, cacheKey: Date.now() }, ...filtered].sort(
              (a, b) => Number(b.year) - Number(a.year),
            );
          } else {
            // replace by originalYear (record-level edit)
            return prev
              .map((c) =>
                c.year === originalYear
                  ? { ...returned, cacheKey: Date.now() }
                  : c,
              )
              .sort((a, b) => Number(b.year) - Number(a.year));
          }
        });
        setEditingKey(null);
        setDraft(null);
        setImageFile(null);
        setPreviewURL(null);
      })
      .catch((err) => window.alert(`Save failed: ${err.message}`));
  };

  // ──────────────────────────────────────────────────────────
  // Image file change
  // ──────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  // ──────────────────────────────────────────────────────────
  // UI
  // ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="schedule-header">
        <h1>Past Champions</h1>
        <button className="btn-add-event">Add Champion</button>
        <p>Loading…</p>
      </div>
    );
  }

  // Show other errors, but not empty-list 404s (handled above)
  if (error) {
    return (
      <div className="schedule-header">
        <h1>Past Champions</h1>
        <button className="btn-add-event" onClick={handleAddChampion}>
          Add Champion
        </button>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="schedule-header">
        <h1>Past Champions</h1>
        <button className="btn-add-event" onClick={handleAddChampion}>
          Add Champion
        </button>
      </div>

      {/* Cards */}
      {champions.length === 0 ? (
        <p>No champions yet.</p>
      ) : (
        champions.map((c) => {
          // Always prefer the temp key first so new rows stay "new"
          const key = c.key ?? c.year;
          const isEditing = editingKey === (c.key ?? c.year);
          const isNew =
            typeof c.key === "string" && c.key.startsWith("__new__");
          const originalYear = isNew ? draft?._originalYear : c.year;

          return (
            <div
              className={`card-table-container card-table-width5 ${isEditing ? "editing" : ""}`}
              key={key}
            >
              {/* Header: Year (or input when editing) */}
              {isEditing ? (
                <input
                  type="number"
                  className="header-input"
                  value={draft.year}
                  placeholder="Year"
                  onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                />
              ) : (
                <div className="card-table-header">{c.year}</div>
              )}

              <table className="event-table">
                <tbody>
                  <tr>
                    {/* Left image cell */}
                    <td className="cell-image2" rowSpan="2">
                      {isEditing ? (
                        <>
                          <img
                            src={
                              previewURL
                                ? previewURL
                                : c.thumbnail
                                  ? getImageUrl(
                                      `/api/champions/${originalYear}/image`,
                                    )
                                  : "/images/default-image.webp"
                            }
                            alt={`${draft.year} champion image`}
                            className="event-thumbnail2 clickable-image"
                            onClick={() => fileInputRef.current?.click()}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "/images/default-image.webp";
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                          />
                        </>
                      ) : (
                        <img
                          src={getImageUrl(`/api/champions/${c.year}/image`)}
                          alt={`${c.year} champion image`}
                          className="event-thumbnail2"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/default-image.webp";
                          }}
                        />
                      )}
                    </td>

                    {/* Player */}
                    <td className="cell-label">Player</td>
                    <td className="cell-value5">
                      {isEditing ? (
                        <input
                          type="text"
                          className="cell-input"
                          placeholder="Player name"
                          value={draft.player}
                          onChange={(e) =>
                            setDraft({ ...draft, player: e.target.value })
                          }
                        />
                      ) : (
                        c.player || "—"
                      )}
                    </td>

                    {/* Actions */}
                    <td className="cell-actions" rowSpan="2">
                      {isEditing ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={() => handleSave(isNew, originalYear)}
                          >
                            Save
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              if (isNew) {
                                setChampions((prev) =>
                                  prev.filter((x) => x.key !== c.key),
                                );
                              }
                              setEditingKey(null);
                              setDraft(null);
                              setImageFile(null);
                              setPreviewURL(null);
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setEditingKey(c.key ?? c.year);
                              setDraft({
                                year: c.year,
                                player: c.player || "",
                                _originalYear: c.year,
                              });
                              setImageFile(null);
                              setPreviewURL(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(c)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Year (editable duplicate to keep 2-row layout consistent) */}
                  <tr>
                    <td className="cell-label">Year</td>
                    <td className="cell-value5">
                      {isEditing ? (
                        <input
                          type="number"
                          className="cell-input"
                          placeholder="YYYY"
                          value={draft.year}
                          onChange={(e) =>
                            setDraft({ ...draft, year: e.target.value })
                          }
                        />
                      ) : (
                        c.year
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </>
  );
}
