// src/components/AdminStandings.jsx
import React, { useState, useEffect } from 'react';
import './AdminStandings.css';

export default function AdminStandings() {
  // ■ 1) State
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which standing (by yearId) is in “edit mode” right now
  const [editingId, setEditingId] = useState(null);
  // Draft object for the row being edited
  const [draft, setDraft] = useState(null);
  // Counter to give temporary IDs for newly added rows
  const [newCount, setNewCount] = useState(0);

  // ■ 2) Helper: strip “http(s)://” and truncate to ~25 chars for display
  function stripProtocol(url) {
    if (!url) return '';
    const withoutProto = url.replace(/^https?:\/\//, '');
    const MAX = 25;
    return withoutProto.length <= MAX
      ? withoutProto
      : withoutProto.slice(0, MAX - 1) + '...';
  }

  // ■ 3) Fetch all standings on mount
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/standings', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Expecting data.standings = [ { id: <string or number>, year: 2025, netUrl: "...", grossUrl: "..." }, ... ]
        if (Array.isArray(data.standings)) {
          // Give each a cacheKey so we can bust after update
          const withKeys = data.standings.map((s) => ({
            ...s,
            cacheKey: Date.now(),
          }));
          setStandings(withKeys);
        } else {
          setStandings([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch standings:', err);
        setError(err.message || 'Unknown error');
      })
      .finally(() => setLoading(false));
  }, []);

  // ■ 4) Loading / Error UI
  if (loading) {
    return (
      <div className="standings-header">
        <h1>Standings</h1>
        <button className="btn-add-standing">Add Year</button>
        <p>Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="standings-header">
        <h1>Standings</h1>
        <button className="btn-add-standing">Add Year</button>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  // ■ 5) Handle adding a brand‑new “year” entry (temporary)
  const handleAdd = () => {
    const tempId = `__new__${newCount + 1}`;
    setNewCount((n) => n + 1);

    // Blank placeholder
    const blank = {
      id: tempId,
      year: new Date().getFullYear(), // default to current
      netUrl: '',
      grossUrl: '',
      cacheKey: Date.now(),
    };

    setStandings((prev) => [blank, ...prev]);
    setEditingId(tempId);
    setDraft(blank);
  };

  // ■ 6) Handle deleting (either remove temp or send DELETE)
  const handleDelete = (row) => {
    const isNew = String(row.id).startsWith('__new__');
    if (isNew) {
      setStandings((prev) => prev.filter((s) => s.id !== row.id));
    } else {
      fetch(`http://localhost:8080/standings/${row.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          // remove from state
          setStandings((prev) => prev.filter((s) => s.id !== row.id));
        })
        .catch((err) => console.error('Delete failed:', err));
    }
  };

  // ■ 7) Render
  return (
    <>
      {/* ─── Header (title + “Add Year”) ───────────────────────────── */}
      <div className="standings-header">
        <h1>Standings</h1>
        <button className="btn-add-standing" onClick={handleAdd}>
          Add Year
        </button>
      </div>

      {standings.length === 0 ? (
        <p>No years found.</p>
      ) : (
        standings.map((row) => {
          const isEditing = editingId === row.id;
          const isNew = String(row.id).startsWith('__new__');

          return (
            <div
              className={`card-table-container ${isEditing ? 'editing' : ''}`}
              key={row.id}
            >
              {/* ── 1) Header Bar ─────────────────────────────────────── */}
              {isEditing ? (
                <input
                  type="number"
                  className="header-input"
                  value={draft.year || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, year: e.target.value })
                  }
                />
              ) : (
                <div className="card-table-header">{row.year}</div>
              )}

              {/* ── 2) “Standings” table: Year + Net URL + Gross URL + Actions ───── */}
              <table className="standings-table">
                <tbody>
                  {/* Row 1: Year | Net URL | Actions */}
                  <tr>
                    <td className="cell-label">Year</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="number"
                          className="cell-input"
                          value={draft.year || ''}
                          onChange={(e) =>
                            setDraft({ ...draft, year: e.target.value })
                          }
                        />
                      ) : (
                        row.year
                      )}
                    </td>

                    <td className="cell-label">Net URL</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          placeholder="https://..."
                          value={draft.netUrl || ''}
                          onChange={(e) =>
                            setDraft({ ...draft, netUrl: e.target.value })
                          }
                        />
                      ) : row.netUrl ? (
                        <a
                          href={row.netUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {stripProtocol(row.netUrl)}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="cell-actions" rowSpan="2">
                      {isEditing ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={() => {
                              // Build FormData
                              const form = new FormData();
                              form.append(
                                'standing',
                                JSON.stringify({
                                  year: draft.year,
                                  netUrl: draft.netUrl,
                                  grossUrl: draft.grossUrl,
                                })
                              );

                              const url = isNew
                                ? 'http://localhost:8080/standings'
                                : `http://localhost:8080/standings/${draft.id}`;
                              const method = isNew ? 'POST' : 'PUT';

                              fetch(url, {
                                method,
                                credentials: 'include',
                                body: form,
                              })
                                .then((res) => {
                                  if (!res.ok)
                                    throw new Error(`HTTP ${res.status}`);
                                  return res.json();
                                })
                                .then((returned) => {
                                  setStandings((prev) => {
                                    if (isNew) {
                                      // drop all __new__ placeholders, prepend real
                                      const filtered = prev.filter(
                                        (s) => !String(s.id).startsWith('__new__')
                                      );
                                      return [
                                        {
                                          ...returned,
                                          cacheKey: Date.now(),
                                        },
                                        ...filtered,
                                      ];
                                    } else {
                                      // replace existing row, update cacheKey
                                      return prev.map((s) =>
                                        s.id === returned.id
                                          ? {
                                              ...returned,
                                              cacheKey: Date.now(),
                                            }
                                          : s
                                      );
                                    }
                                  });
                                  setEditingId(null);
                                  setDraft(null);
                                })
                                .catch((err) => console.error('Save failed:', err));
                            }}
                          >
                            Save
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              // If it was new, drop it entirely
                              if (isNew) {
                                setStandings((prev) =>
                                  prev.filter((s) => s.id !== row.id)
                                );
                              }
                              setEditingId(null);
                              setDraft(null);
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
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Gross URL (and an empty pair to keep 5 columns) */}
                  <tr>
                    <td className="cell-label">Gross URL</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          placeholder="https://..."
                          value={draft.grossUrl || ''}
                          onChange={(e) =>
                            setDraft({ ...draft, grossUrl: e.target.value })
                          }
                        />
                      ) : row.grossUrl ? (
                        <a
                          href={row.grossUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {stripProtocol(row.grossUrl)}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* filler pair so that table stays 5 columns wide */}
                    <td className="cell-label">&nbsp;</td>
                    <td className="cell-value">&nbsp;</td>
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

