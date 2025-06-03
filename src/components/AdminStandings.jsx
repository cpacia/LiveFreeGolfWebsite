// src/components/AdminStandings.jsx
import React, { useState, useEffect } from 'react';
import './AdminStandings.css';

export default function AdminStandings() {
  // ─── 1) State Hooks ──────────────────────────────────────────────
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [newCount, setNewCount] = useState(0);

  // ─── 2) Utility: strip “http(s)://” + truncate ────────────────────
  function stripProtocol(url) {
    if (!url) return '';
    const noProto = url.replace(/^https?:\/\//, '');
    const MAX = 38;
    return noProto.length <= MAX ? noProto : noProto.slice(0, MAX - 1) + '...';
  }

  // ─── 3) Fetch existing standings on mount ─────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/standings-urls', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((row) => ({
            id: row.ID || row.id,
            calendarYear: row.calendarYear,
            seasonStandingsUrl: row.seasonStandingsUrl,
            wgrStandingsUrl: row.wgrStandingsUrl,
            cacheKey: Date.now(),
          }));
          setStandings(normalized);
        } else {
          setStandings([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching standings:', err);
        setError(err.message || 'Unknown error');
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── 4) Loading / Error States ───────────────────────────────────
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

  // ─── 5) “Add Year” Handler ────────────────────────────────────────
  const handleAdd = () => {
    const tempId = `__new__${newCount + 1}`;
    setNewCount((n) => n + 1);

    const todayYear = new Date().getFullYear().toString();
    const placeholder = {
      id: tempId,
      calendarYear: todayYear,
      seasonStandingsUrl: '',
      wgrStandingsUrl: '',
      cacheKey: Date.now(),
    };

    setStandings((prev) => [placeholder, ...prev]);
    setEditingId(tempId);
    setDraft(placeholder);
  };

  // ─── 6) Save (POST or PUT) with error dialog ─────────────────────
  const handleSave = () => {
    if (!draft) return;

    const isNew = String(draft.id).startsWith('__new__');
    const url = 'http://localhost:8080/standings-urls';
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...(isNew ? {} : { ID: draft.id }),
      calendarYear: draft.calendarYear,
      seasonStandingsUrl: draft.seasonStandingsUrl,
      wgrStandingsUrl: draft.wgrStandingsUrl,
    };

    fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
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
          calendarYear: returned.calendarYear,
          seasonStandingsUrl: returned.seasonStandingsUrl,
          wgrStandingsUrl: returned.wgrStandingsUrl,
          cacheKey: Date.now(),
        };

        setStandings((prev) => {
          if (isNew) {
            const filtered = prev.filter(
              (r) => !String(r.id).startsWith('__new__')
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
        console.error('Save failed:', err);
        window.alert(`Save failed: ${err.message}`);
      });
  };

  // ─── 7) Cancel Editing ────────────────────────────────────────────
  const handleCancel = (row) => {
    const isNew = String(row.id).startsWith('__new__');
    if (isNew) {
      setStandings((prev) => prev.filter((r) => r.id !== row.id));
    }
    setEditingId(null);
    setDraft(null);
  };

  // ─── 8) Delete (by calendarYear) ─────────────────────────────────
  const handleDelete = (row) => {
    if (
      !window.confirm(
        `Are you sure you want to delete standings for ${row.calendarYear}?`
      )
    ) {
      return;
    }

    fetch('http://localhost:8080/standings-urls', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarYear: row.calendarYear }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStandings((prev) =>
          prev.filter((r) => r.calendarYear !== row.calendarYear)
        );
      })
      .catch((err) => console.error('Delete failed:', err));
  };

  // ─── 9) Refresh (by calendarYear) ─────────────────────────────────
  const handleRefresh = (row) => {
    if (
      !window.confirm(
        `Are you sure you want to refresh standings for ${row.calendarYear}?`
      )
    ) {
      return;
    }

    fetch('http://localhost:8080/refresh-standings', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarYear: row.calendarYear }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        console.log(`Refreshed standings for ${row.calendarYear}`);
      })
      .catch((err) => console.error('Refresh failed:', err));
  };

  // ─── 10) Main Render ─────────────────────────────────────────────
  return (
    <>
      {/* Header + “Add Year” */}
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

          return (
            <div
              className={`card-table-container card-table-width ${isEditing ? 'editing' : ''}`}
              key={row.id + '_' + row.cacheKey}
            >
              {/* Header Bar: Static “Calendar Year” */}
              <div className="card-table-header">{row.calendarYear}</div>

              <table className="standings-table">
                <tbody>
                  {/* Row 1: Calendar Year + Actions (spanning 3 rows) */}
                  <tr>
                    <td className="cell-label">Calendar Year</td>
                    <td className="cell-value2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="cell-input"
                          value={draft.calendarYear}
                          onChange={(e) =>
                            setDraft({ ...draft, calendarYear: e.target.value })
                          }
                        />
                      ) : (
                        row.calendarYear
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

                  {/* Row 2: Season Standings URL */}
                  <tr>
                    <td className="cell-label">Season Standings URL</td>
                    <td className="cell-value2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          placeholder="https://..."
                          value={draft.seasonStandingsUrl}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              seasonStandingsUrl: e.target.value,
                            })
                          }
                        />
                      ) : row.seasonStandingsUrl ? (
                        <a
                          href={row.seasonStandingsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {stripProtocol(row.seasonStandingsUrl)}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>

                  {/* Row 3: WGR Standings URL */}
                  <tr>
                    <td className="cell-label">WGR Standings URL</td>
                    <td className="cell-value2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          placeholder="https://..."
                          value={draft.wgrStandingsUrl}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              wgrStandingsUrl: e.target.value,
                            })
                          }
                        />
                      ) : row.wgrStandingsUrl ? (
                        <a
                          href={row.wgrStandingsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {stripProtocol(row.wgrStandingsUrl)}
                        </a>
                      ) : (
                        '—'
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

