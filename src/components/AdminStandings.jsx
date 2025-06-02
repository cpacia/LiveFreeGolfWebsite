// src/components/AdminStandings.jsx
import React, { useState, useEffect } from 'react';
import './AdminStandings.css';

export default function AdminStandings() {
  // ─── 1) State Hooks ──────────────────────────────────────────────
  const [standings, setStandings] = useState([]); // array of { id, calendarYear, seasonStandingsUrl, wgrStandingsUrl, cacheKey }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null); // which record is in edit mode
  const [draft, setDraft] = useState(null);         // draft copy of the record being edited
  const [newCount, setNewCount] = useState(0);      // for generating temporary IDs

  // ─── 2) Utility: strip protocol + truncate to ~25 chars ──────────
  function stripProtocol(url) {
    if (!url) return '';
    const noProto = url.replace(/^https?:\/\//, '');
    const MAX = 25;
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
        // Expect data to be an array of objects:
        // [ { ID, calendarYear, seasonStandingsUrl, wgrStandingsUrl, ...gorm fields }, … ]
        // We’ll only keep the fields we need, plus a cacheKey for re‐rendering
        if (Array.isArray(data)) {
          const normalized = data.map((row) => ({
            id: row.ID || row.id, // GORM’s ID field
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

  // ─── 6) Save (POST or PUT) ────────────────────────────────────────
  const handleSave = () => {
    if (!draft) return;

    const isNew = String(draft.id).startsWith('__new__');
    const url = 'http://localhost:8080/standings-urls';
    const method = isNew ? 'POST' : 'PUT';

    // We send JSON body: { id?, calendarYear, seasonStandingsUrl, wgrStandingsUrl }
    // For PUT, GORM expects an ID field in the JSON so it knows which record to update.
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((returned) => {
        // GORM typically returns the full saved object, including ID for POST.
        const saved = {
          id: returned.ID || returned.id,
          calendarYear: returned.calendarYear,
          seasonStandingsUrl: returned.seasonStandingsUrl,
          wgrStandingsUrl: returned.wgrStandingsUrl,
          cacheKey: Date.now(),
        };

        setStandings((prev) => {
          if (isNew) {
            // Remove any “__new__” placeholders, then prepend the real saved row.
            const filtered = prev.filter(
              (r) => !String(r.id).startsWith('__new__')
            );
            return [saved, ...filtered];
          } else {
            // Replace the edited row in place
            return prev.map((r) =>
              r.id === saved.id ? saved : r
            );
          }
        });

        setEditingId(null);
        setDraft(null);
      })
      .catch((err) => console.error('Save failed:', err));
  };

  // ─── 7) Cancel Editing ────────────────────────────────────────────
  const handleCancel = (row) => {
    const isNew = String(row.id).startsWith('__new__');
    if (isNew) {
      // Drop the placeholder entirely
      setStandings((prev) => prev.filter((r) => r.id !== row.id));
    }
    setEditingId(null);
    setDraft(null);
  };

  // ─── 8) Main Render ──────────────────────────────────────────────
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
          const isNew = String(row.id).startsWith('__new__');

          return (
            <div
              className={`card-table-container ${isEditing ? 'editing' : ''}`}
              key={row.id + '_' + row.cacheKey}
            >
              {/* ── Header Bar: “Calendar Year” ───────────────────── */}
              {isEditing ? (
                <input
                  type="text"
                  className="header-input"
                  value={draft.calendarYear}
                  onChange={(e) =>
                    setDraft({ ...draft, calendarYear: e.target.value })
                  }
                />
              ) : (
                <div className="card-table-header">
                  {row.calendarYear}
                </div>
              )}

              {/* ── Details Table ─────────────────────────────────── */}
              <table className="standings-table">
                <tbody>
                  {/* Row 1: “Calendar Year” | “Season URL” | Actions */}
                  <tr>
                    <td className="cell-label">Calendar Year</td>
                    <td className="cell-value">
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

                    <td className="cell-label">Season Standings URL</td>
                    <td className="cell-value">
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

                    <td className="cell-actions" rowSpan="2">
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
                        <button
                          className="btn-edit"
                          onClick={() => {
                            setEditingId(row.id);
                            setDraft({ ...row });
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: “WGR URL” + filler cells */}
                  <tr>
                    <td className="cell-label">WGR Standings URL</td>
                    <td className="cell-value">
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

                    {/* Two empty cells just to keep 5 columns wide */}
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

