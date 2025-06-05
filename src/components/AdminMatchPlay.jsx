// src/components/AdminMatchPlay.jsx
import React, { useState, useEffect } from "react";
import "./AdminStandings.css";

export default function AdminMatchPlay() {
  // ─── 1) State Hooks ──────────────────────────────────────────────
  const [standings, setMatchPlay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [newCount, setNewCount] = useState(0);

  // ─── 2) Utility: strip “http(s)://” + truncate ────────────────────
  function stripProtocol(url) {
    if (!url) return "";
    const noProto = url.replace(/^https?:\/\//, "");
    const MAX = 38;
    return noProto.length <= MAX ? noProto : noProto.slice(0, MAX - 1) + "...";
  }

  // ─── 3) Fetch existing standings on mount ─────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/match-play", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((row) => ({
            id: row.ID || row.id,
            year: row.year,
            bracketUrl: row.bracketUrl,
            registrationOpen: row.registrationOpen,
            shopifyUrl: row.shopifyUrl,
            cacheKey: Date.now(),
          }));
          setMatchPlay(normalized);
        } else {
          setMatchPlay([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching match play:", err);
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── 4) Loading / Error States ───────────────────────────────────
  if (loading) {
    return (
      <div className="standings-header">
        <h1>Match Play</h1>
        <button className="btn-add-standing">Add Year</button>
        <p>Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="standings-header">
        <h1>Match Play</h1>
        <button className="btn-add-standing">Add Year</button>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  // ─── 5) “Add Year” Handler ────────────────────────────────────────
  const handleAdd = () => {
    const tempId = `__new__${newCount + 1}`;
    setNewCount((n) => n + 1);

    const todayYear = new Date().getFullYear().toString();
    const placeholder = {
      id: tempId,
      year: todayYear,
      bracketUrl: "",
      registrationOpen: false,
      shopifyUrl: "",
      cacheKey: Date.now(),
    };

    setMatchPlay((prev) => [placeholder, ...prev]);
    setEditingId(tempId);
    setDraft(placeholder);
  };

  // ─── 6) Save (POST or PUT) with error dialog ─────────────────────
  const handleSave = () => {
    if (!draft) return;

    const isNew = String(draft.id).startsWith("__new__");
    const url = "http://localhost:8080/match-play";
    const method = isNew ? "POST" : "PUT";

    const payload = {
      ...(isNew ? {} : { ID: draft.id }),
      year: draft.year,
      bracketUrl: draft.bracketUrl,
      shopifyUrl: draft.shopifyUrl,
      registrationOpen: draft.registrationOpen,
    };

    fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(text || `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then((returned) => {
        const saved = {
          id: returned.ID || returned.id,
          year: returned.year,
          bracketUrl: returned.bracketUrl,
          registrationOpen: returned.registrationOpen,
          shopifyUrl: returned.shopifyUrl,
          cacheKey: Date.now(),
        };

        setMatchPlay((prev) => {
          if (isNew) {
            const filtered = prev.filter(
              (r) => !String(r.id).startsWith("__new__"),
            );
            return [saved, ...filtered];
          } else {
            return prev.map((r) => (r.id === saved.id ? saved : r));
          }
        });

        setEditingId(null);
        setDraft(null);
      })
      .catch((err) => {
        console.error("Save failed:", err);
        window.alert(`Save failed: ${err.message}`);
      });
  };

  // ─── 7) Cancel Editing ────────────────────────────────────────────
  const handleCancel = (row) => {
    const isNew = String(row.id).startsWith("__new__");
    if (isNew) {
      setMatchPlay((prev) => prev.filter((r) => r.id !== row.id));
    }
    setEditingId(null);
    setDraft(null);
  };

  // ─── 8) Delete (by calendarYear) ─────────────────────────────────
  const handleDelete = (row) => {
    if (
      !window.confirm(
        `Are you sure you want to delete match play for ${row.year}?`,
      )
    ) {
      return;
    }

    fetch("http://localhost:8080/match-play", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: row.year }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setMatchPlay((prev) => prev.filter((r) => r.year !== row.year));
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  // ─── 9) Refresh (by calendarYear) ─────────────────────────────────
  const handleRefresh = (row) => {
    if (
      !window.confirm(
        `Are you sure you want to refresh match play bracket for ${row.year}?`,
      )
    ) {
      return;
    }

    fetch("http://localhost:8080/refresh-match-play-bracket", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: row.year }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        console.log(`Refreshed standings for ${row.year}`);
      })
      .catch((err) => console.error("Refresh failed:", err));
  };

  // ─── 10) Main Render ─────────────────────────────────────────────
  return (
    <>
      {/* Header + “Add Year” */}
      <div className="standings-header">
        <h1>Match Play</h1>
        <button className="btn-add-standing" onClick={handleAdd}>
          Add Year
        </button>
      </div>
      {standings.length === 0 ? (
        <p>No years found.</p>
      ) : (
        standings.map((row) => {
          const isEditing = editingId === row.id;

          return (
            <div
              className={`card-table-container card-table-width ${isEditing ? "editing" : ""}`}
              key={row.id + "_" + row.cacheKey}
            >
              {/* Header Bar: Static “Calendar Year” */}
              <div className="card-table-header">{row.year}</div>

              <table className="admin-standings-table">
                <tbody>
                  {/* Row 1: Calendar Year + Actions (spanning 3 rows) */}
                  <tr>
                    <td className="cell-label">Year</td>
                    <td className="cell-value2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="cell-input"
                          value={draft.year}
                          onChange={(e) =>
                            setDraft({ ...draft, year: e.target.value })
                          }
                        />
                      ) : (
                        row.year
                      )}
                    </td>
                    <td className="cell-actions" rowSpan="3">
                      {isEditing ? (
                        <>
                          <button className="btn-save" onClick={handleSave}>
                            Save
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancel(row)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setEditingId(row.id);
                              setDraft({ ...row });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(row)}
                          >
                            Delete
                          </button>
                          <button
                            className="btn-refresh"
                            onClick={() => handleRefresh(row)}
                          >
                            Refresh
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Bracket Url */}
                  <tr>
                    <td className="cell-label">Bracket URL</td>
                    <td className="cell-value2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          placeholder="https://..."
                          value={draft.bracketUrl}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              bracketUrl: e.target.value,
                            })
                          }
                        />
                      ) : row.bracketUrl ? (
                        <a
                          href={row.bracketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {stripProtocol(row.bracketUrl)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>

                  {/* Row 3: Shopify URL */}
                  <tr>
                    <td className="cell-label">Shopify URL</td>
                    <td className="cell-value2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          placeholder="https://..."
                          value={draft.shopifyUrl}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              shopifyUrl: e.target.value,
                            })
                          }
                        />
                      ) : row.bracketUrl ? (
                        <a
                          href={row.shopifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {stripProtocol(row.shopifyUrl)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>

                  {/* Row 4: Registration Open */}
                  <tr>
                    <td className="cell-label">Registration Open</td>
                    <td className="cell-value2">
                      {isEditing ? (
                        <select
                          value={draft.registrationOpen ? "yes" : "no"}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              registrationOpen: e.target.value === "yes",
                            })
                          }
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      ) : row.registrationOpen ? (
                        <span className="status-open">Yes</span>
                      ) : (
                        <span className="status-closed">No</span>
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
