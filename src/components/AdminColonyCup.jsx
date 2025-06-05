// src/components/AdminColonyCup.jsx
import React, { useState, useEffect } from "react";
import "./AdminStandings.css"; // Reuse card/table styling

export default function AdminColonyCup() {
  // ─── 1) State Hooks ──────────────────────────────────────────────
  const [info, setInfo] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Temporary input for adding a new golfer to the list
  const [newGolfer, setNewGolfer] = useState("");

  // ─── 2) Fetch single ColonyCupInfo on mount ──────────────────────
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/colony-cup", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Expect data = { ID, year, winningTeam: [ "Name1", "Name2", ... ], … }
        // winningTeam might already be a JS array or string—normalize to array:
        let teamArray = [];
        if (Array.isArray(data.winningTeam)) {
          teamArray = data.winningTeam;
        } else if (typeof data.winningTeam === "string") {
          try {
            teamArray = JSON.parse(data.winningTeam);
          } catch {
            teamArray = [];
          }
        }
        const fresh = {
          id: data.ID || data.id,
          year: data.year || "",
          winningTeam: teamArray,
        };
        setInfo(fresh);
        setDraft({ ...fresh });
      })
      .catch((err) => {
        console.error("Error fetching colony cup info:", err);
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── 3) Loading / Error UI ───────────────────────────────────────
  if (loading) {
    return (
      <div className="standings-header">
        <h1>Colony Cup Settings</h1>
        <p>Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="standings-header">
        <h1>Colony Cup Settings</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }
  if (!info) {
    return null;
  }

  // ─── 4) Handle “Edit” ─────────────────────────────────────────────
  const handleEdit = () => {
    setDraft({
      year: info.year,
      winningTeam: [...info.winningTeam], // clone array
    });
    setIsEditing(true);
    setNewGolfer("");
  };

  // ─── 5) Handle “Cancel” ───────────────────────────────────────────
  const handleCancel = () => {
    // Discard draft, revert to info
    setDraft({ year: info.year, winningTeam: [...info.winningTeam] });
    setIsEditing(false);
    setNewGolfer("");
  };

  // ─── 6) Handle adding a new golfer to the list ────────────────────
  const handleAddGolfer = () => {
    const name = newGolfer.trim();
    if (!name) return;
    if (draft.winningTeam.includes(name)) {
      window.alert("This golfer is already in the winning team list.");
      return;
    }
    setDraft({
      ...draft,
      winningTeam: [...draft.winningTeam, name],
    });
    setNewGolfer("");
  };

  // ─── 7) Handle removing a golfer by index ─────────────────────────
  const handleRemoveGolfer = (index) => {
    const updated = draft.winningTeam.filter((_, i) => i !== index);
    setDraft({ ...draft, winningTeam: updated });
  };

  // ─── 8) Handle “Save” (PUT) with error dialog ──────────────────────
  const handleSave = () => {
    if (!draft.year.trim()) {
      window.alert("Year cannot be empty.");
      return;
    }
    // You could also enforce at least one golfer
    // if (draft.winningTeam.length === 0) {
    //   window.alert('Winning team must include at least one name.');
    //   return;
    // }

    const payload = {
      ID: info.id,
      year: draft.year,
      winningTeam: draft.winningTeam,
    };
    console.log("Saving ColonyCup payload:", payload);

    fetch("http://localhost:8080/colony-cup", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(text || `HTTP ${res.status}`);
        }
        // If server returned JSON, parse it; else ignore
        return text ? JSON.parse(text) : null;
      })
      .then((returned) => {
        if (returned) {
          // Ensure winningTeam is array
          let teamArr = [];
          if (Array.isArray(returned.winningTeam)) {
            teamArr = returned.winningTeam;
          } else if (typeof returned.winningTeam === "string") {
            try {
              teamArr = JSON.parse(returned.winningTeam);
            } catch {
              teamArr = [];
            }
          }
          setInfo({
            id: returned.ID || returned.id,
            year: returned.year,
            winningTeam: teamArr,
          });
        } else {
          setInfo({
            id: info.id,
            year: draft.year,
            winningTeam: [...draft.winningTeam],
          });
        }
        setIsEditing(false);
      })
      .catch((err) => {
        console.error("Save failed:", err);
        window.alert(`Error saving colony cup info: ${err.message}`);
      });
  };

  // ─── 9) Render the card/table ─────────────────────────────────────
  return (
    <div className="colony-cup-page">
      {/* Header */}
      <div
        className="card-table-header card-table-header-width"
        style={{ marginBottom: "1rem" }}
      >
        Colony Cup Settings
      </div>

      <div
        className={`card-table-container card-table-width ${isEditing ? "editing" : ""}`}
      >
        <table className="admin-standings-table">
          <tbody>
            {/* Row 1: Year + Actions (rowSpan=3) */}
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
                  info.year
                )}
              </td>
              <td className="cell-actions" rowSpan="3">
                {isEditing ? (
                  <>
                    <button className="btn-save" onClick={handleSave}>
                      Save
                    </button>
                    <button className="btn-cancel" onClick={handleCancel}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn-edit" onClick={handleEdit}>
                    Edit
                  </button>
                )}
              </td>
            </tr>

            {/* Row 2: Winning Team label + dynamic list/editor */}
            <tr>
              <td className="cell-label">Winning Team</td>
              <td className="cell-value">
                {isEditing ? (
                  <div className="winning-list-editor">
                    {draft.winningTeam.map((name, idx) => (
                      <div key={idx} className="winning-item">
                        <input
                          type="text"
                          className="cell-input"
                          value={name}
                          onChange={(e) => {
                            const updated = [...draft.winningTeam];
                            updated[idx] = e.target.value;
                            setDraft({ ...draft, winningTeam: updated });
                          }}
                        />
                        <button
                          className="btn-delete"
                          style={{
                            marginLeft: "0.5rem",
                            padding: "0.3rem 0.6rem",
                          }}
                          onClick={() => handleRemoveGolfer(idx)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}

                    {/* Input to add a new golfer */}
                    <div
                      className="add-new-golfer"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <input
                        type="text"
                        className="cell-input"
                        placeholder="New golfer name"
                        value={newGolfer}
                        onChange={(e) => setNewGolfer(e.target.value)}
                      />
                      <button
                        className="btn-save"
                        style={{
                          marginLeft: "0.5rem",
                          padding: "0.3rem 0.6rem",
                        }}
                        onClick={handleAddGolfer}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : info.winningTeam.length > 0 ? (
                  <span>{info.winningTeam.join(", ")}</span>
                ) : (
                  <span>—</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
