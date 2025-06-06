// src/components/AdminColonyCup.jsx
import React, { useState, useEffect } from "react";
import "./AdminColonyCup.css";

export default function AdminColonyCup() {
  // ─── 1) State Hooks ──────────────────────────────────────────────
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [newCount, setNewCount] = useState(0);

  // ─── 2) Fetch existing colony-cup entries on mount ────────────────
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/colony-cup/all", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((row) => ({
            // gorm.Model yields an "ID" field
            id: row.ID ?? row.id,
            year: row.year,
            // "team" is a JSON list (array of player names)
            team: Array.isArray(row.team) ? row.team : [],
            winningTeam: !!row.winningTeam,
            cacheKey: Date.now(),
          }));
          setEntries(normalized);
        } else {
          setEntries([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching colony cup:", err);
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── 3) Loading / Error States ───────────────────────────────────
  if (loading) {
    return (
      <div className="standings-header">
        <h1>Colony Cup</h1>
        <button className="btn-add-standing" disabled>
          Add Year
        </button>
        <p>Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="standings-header">
        <h1>Colony Cup</h1>
        <button className="btn-add-standing" disabled>
          Add Year
        </button>
        <p className="error-text">Error: {error}</p>
      </div>
    );
  }

  // ─── 4) “Add Year” Handler ────────────────────────────────────────
  const handleAdd = () => {
    const tempId = `__new__${newCount + 1}`;
    setNewCount((n) => n + 1);

    const todayYear = new Date().getFullYear().toString();
    const placeholder = {
      id: tempId,
      year: todayYear,
      team: [""], // start with one empty player
      winningTeam: false,
      cacheKey: Date.now(),
    };

    setEntries((prev) => [placeholder, ...prev]);
    setEditingId(tempId);
    setDraft(placeholder);
  };

  // ─── 5) Handle Save (POST or PUT) ─────────────────────────────────
  const handleSave = () => {
    if (!draft) return;

    const isNew = String(draft.id).startsWith("__new__");
    const url = "http://localhost:8080/colony-cup";
    const method = isNew ? "POST" : "PUT";

    // Prepare payload: if updating, include ID; otherwise omit
    const payload = {
      ...(isNew ? {} : { ID: draft.id }),
      year: draft.year,
      team: JSON.stringify(draft.team.filter((p) => p.trim() !== "")),
      winningTeam: draft.winningTeam,
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
          id: returned.ID ?? returned.id,
          year: returned.year,
          team: Array.isArray(returned.team)
            ? returned.team
            : JSON.parse(returned.team || "[]"),
          winningTeam: !!returned.winningTeam,
          cacheKey: Date.now(),
        };

        setEntries((prev) => {
          if (isNew) {
            // Remove any "__new__" placeholder, then prepend saved
            const filtered = prev.filter(
              (r) => !String(r.id).startsWith("__new__")
            );
            return [saved, ...filtered];
          } else {
            // Replace the updated entry in place
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

  // ─── 6) Cancel Editing ────────────────────────────────────────────
  const handleCancel = (entry) => {
    const isNew = String(entry.id).startsWith("__new__");
    if (isNew) {
      setEntries((prev) => prev.filter((r) => r.id !== entry.id));
    }
    setEditingId(null);
    setDraft(null);
  };

  // ─── 7) Delete Entry ──────────────────────────────────────────────
  const handleDelete = (entry) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the Colony Cup entry for ${entry.year}?`
      )
    ) {
      return;
    }

    fetch("http://localhost:8080/colony-cup", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ID: entry.id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setEntries((prev) => prev.filter((r) => r.id !== entry.id));
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  // ─── 8) Add a new player field in edit mode ──────────────────────
  const handleAddPlayer = () => {
    setDraft((prev) => ({
      ...prev,
      team: [...prev.team, ""],
    }));
  };

  // ─── 9) Remove a player field in edit mode ───────────────────────
  const handleRemovePlayer = (index) => {
    setDraft((prev) => {
      const newTeam = prev.team.slice();
      newTeam.splice(index, 1);
      return { ...prev, team: newTeam };
    });
  };

  // ─── 10) Main Render ─────────────────────────────────────────────
  return (
    <>
      {/* Header + “Add Year” */}
      <div className="standings-header">
        <h1>Colony Cup</h1>
        <button className="btn-add-standing" onClick={handleAdd}>
          Add Year
        </button>
      </div>

      {entries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        entries.map((entry) => {
          const isEditing = editingId === entry.id;
          return (
            <div
              className={`card-table-container card-table-width ${
                isEditing ? "editing" : ""
              }`}
              key={`${entry.id}_${entry.cacheKey}`}
            >
              {/* Header Bar: Static Year */}
              <div className="card-table-header">{entry.year}</div>

              <table className="admin-standings-table">
                <tbody>
                  {/* Row 1: Year + Actions */}
                  <tr>
                    <td className="cell-label">Year</td>
                    <td className="cell-value">
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
                        entry.year
                      )}
                    </td>
                    <td className="cell-actions" rowSpan="4">
                      {isEditing ? (
                        <>
                          <button className="btn-save" onClick={handleSave}>
                            Save
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancel(entry)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setEditingId(entry.id);
                              setDraft({ ...entry });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(entry)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Winning Team */}
                  <tr>
                    <td className="cell-label">Winning Team?</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <select
                          value={draft.winningTeam ? "yes" : "no"}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              winningTeam: e.target.value === "yes",
                            })
                          }
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      ) : entry.winningTeam ? (
                        <span className="status-yes">Yes</span>
                      ) : (
                        <span className="status-no">No</span>
                      )}
                    </td>
                  </tr>

                  {/* Row 3: Team Members Label */}
                  <tr>
                    <td className="cell-label">Team Members</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <div className="team-edit-container">
                          {draft.team.map((player, idx) => (
                            <div
                              className="player-row"
                              key={`player-${entry.id}-${idx}`}
                            >
                              <input
                                type="text"
                                className="player-input"
                                placeholder={`Player #${idx + 1}`}
                                value={player}
                                onChange={(e) => {
                                  const updated = draft.team.slice();
                                  updated[idx] = e.target.value;
                                  setDraft({ ...draft, team: updated });
                                }}
                              />
                              <button
                                className="btn-remove-player"
                                onClick={() => handleRemovePlayer(idx)}
                                title="Remove this player"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            className="btn-add-player"
                            onClick={handleAddPlayer}
                          >
                            + Add Player
                          </button>
                        </div>
                      ) : entry.team.length > 0 ? (
                        <ul className="team-list">
                          {entry.team.map((p, i) => (
                            <li key={`view-${entry.id}-${i}`}>{p}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="status-none">—</span>
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

