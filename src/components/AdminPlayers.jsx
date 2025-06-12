// src/components/AdminPlayers.jsx
import React, { useState, useEffect } from "react";
import "./AdminPlayers.css";

export default function AdminPlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [draft, setDraft] = useState(null);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    fetch("/api/match-play/players", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setPlayers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = () => {
    const key = `__new__${newCount + 1}`;
    setNewCount((n) => n + 1);
    const newPlayer = { key, player: "", handicap: "" };
    setPlayers((prev) => [newPlayer, ...prev]);
    setEditingPlayer(key);
    setDraft(newPlayer);
  };

  const handleSave = () => {
    if (!draft) return;
    const isNew = String(draft.key).startsWith("__new__");
    const url = "/api/match-play/player";
    const method = isNew ? "POST" : "PUT";
    const payload = isNew
      ? { player: draft.player, handicap: draft.handicap }
      : { player: draft.player, handicap: draft.handicap, originalPlayer: draft.originalPlayer || draft.player };

    fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((text) => { throw new Error(text || `HTTP ${res.status}`); });
        return res.json();
      })
      .then((saved) => {
        // saved has { player, handicap }
        setPlayers((prev) => {
          if (isNew) {
            return [saved, ...prev.filter((p) => p.key !== draft.key)];
          }
          return prev.map((p) => (p.key === draft.key ? saved : p));
        });
        setEditingPlayer(null);
        setDraft(null);
      })
      .catch((err) => {
        console.error("Save failed:", err);
        alert("Save failed: " + err.message);
      });
  };

  const handleCancel = (item) => {
    if (String(item.key).startsWith("__new__")) {
      setPlayers((prev) => prev.filter((p) => p.key !== item.key));
    }
    setEditingPlayer(null);
    setDraft(null);
  };

  const handleDelete = (item) => {
    // delete by player name only
    fetch("/api/match-play/player", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player: item.player }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setPlayers((prev) => prev.filter((p) => p.player !== item.player));
      })
      .catch((err) => {
        console.error("Delete failed:", err);
        alert("Delete failed: " + err.message);
      });
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <>
      <div className="colonycup-header">
        <h1>Match Play Players</h1>
        <button className="btn-add-standing" onClick={handleAdd}>
          Add Player
        </button>
      </div>
      {players.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <table className="admin-players-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Handicap</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((item) => {
              const isEditing = editingPlayer === item.key;
              return (
                <tr key={item.key} className={isEditing ? 'editing' : ''}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="cell-input"
                        value={draft.player}
                        onChange={(e) => setDraft({ ...draft, player: e.target.value })}
                        placeholder="Name"
                      />
                    ) : (
                      item.player
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="cell-input"
                        value={draft.handicap}
                        onChange={(e) => setDraft({ ...draft, handicap: e.target.value })}
                        placeholder="Handicap"
                      />
                    ) : (
                      item.handicap
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button className="btn-save" onClick={handleSave}>
                          Save
                        </button>
                        <button className="btn-cancel" onClick={() => handleCancel(item)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-edit" onClick={() => { setEditingPlayer(item.key); setDraft({ ...item, originalPlayer: item.player }); }}>
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
