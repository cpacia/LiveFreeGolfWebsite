// src/components/AdminMatchPlay.jsx
import React, { useState, useEffect } from 'react';
import './AdminStandings.css'; // Re‑use the same card/table CSS

export default function AdminMatchPlay() {
  // ─── 1) State Hooks ──────────────────────────────────────────────
  const [info, setInfo] = useState(null);        // The fetched MatchPlayInfo
  const [draft, setDraft] = useState(null);      // Local copy while editing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // ─── 2) Fetch the single MatchPlayInfo on mount ──────────────────
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/match-play', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Expect data = { ID, year, registrationOpen, bracketUrl, shopifyUrl, … }
        setInfo({
          id: data.ID || data.id,
          year: data.year,
          registrationOpen: data.registrationOpen,
          bracketUrl: data.bracketUrl,
          shopifyUrl: data.shopifyUrl,
        });
        setDraft({
          year: data.year,
          registrationOpen: data.registrationOpen,
          bracketUrl: data.bracketUrl,
          shopifyUrl: data.shopifyUrl,
        });
      })
      .catch((err) => {
        console.error('Error fetching match-play info:', err);
        setError(err.message || 'Unknown error');
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── 3) Loading / Error UI ───────────────────────────────────────
  if (loading) {
    return (
      <div className="standings-header">
        <h1>Match Play Settings</h1>
        <p>Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="standings-header">
        <h1>Match Play Settings</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }
  if (!info) {
    return null; // Shouldn’t happen, but guard anyway
  }

  // ─── 4) Handle “Edit” button ──────────────────────────────────────
  const handleEdit = () => {
    setDraft({
      year: info.year,
      registrationOpen: info.registrationOpen,
      bracketUrl: info.bracketUrl,
      shopifyUrl: info.shopifyUrl,
    });
    setIsEditing(true);
  };
  
  const handleRefresh = () => {
    if (
      !window.confirm(
        `Are you sure you want to refresh the match play bracket?`
      )
    ) {
      return;
    }

    fetch('http://localhost:8080/refresh-match-play-bracket', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        console.log(`Refreshed standings for ${row.calendarYear}`);
      })
      .catch((err) => console.error('Refresh failed:', err));
  };

  // ─── 5) Handle “Cancel” ───────────────────────────────────────────
  const handleCancel = () => {
    setDraft({
      year: info.year,
      registrationOpen: info.registrationOpen,
      bracketUrl: info.bracketUrl,
      shopifyUrl: info.shopifyUrl,
    });
    setIsEditing(false);
  };

  // ─── 6) Handle “Save” (PUT) with error dialog ─────────────────────
  const handleSave = () => {
    // Basic client‑side check:
    if (!draft.year.trim()) {
      window.alert('Year cannot be empty.');
      return;
    }

    const payload = {
      ID: info.id,
      year: draft.year,
      registrationOpen: draft.registrationOpen,
      bracketUrl: draft.bracketUrl,
      shopifyUrl: draft.shopifyUrl,
    };

    fetch('http://localhost:8080/match-play', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(text || `HTTP ${res.status}`);
        }
        // If the server returns updated JSON, parse it; otherwise ignore.
        return text ? JSON.parse(text) : null;
      })
      .then((returned) => {
        // If server returned JSON, use it; else fallback to draft
        if (returned) {
          setInfo({
            id: returned.ID || returned.id,
            year: returned.year,
            registrationOpen: returned.registrationOpen,
            bracketUrl: returned.bracketUrl,
            shopifyUrl: returned.shopifyUrl,
          });
        } else {
          setInfo({ id: info.id, ...draft });
        }
        setIsEditing(false);
      })
      .catch((err) => {
        console.error('Save failed:', err);
        window.alert(`Error saving match-play info: ${err.message}`);
      });
  };

  // ─── 7) Render the card/table ─────────────────────────────────────
  return (
    <div className="match-play-page">
      {/* Header */}
      <div className="card-table-header card-table-header-width" style={{ marginBottom: '1rem' }}>
        Match Play Settings
      </div>

      <div className={`card-table-container card-table-width ${isEditing ? 'editing' : ''}`}>
        <table className="standings-table">
          <tbody>
            {/* Row 1: Year + Actions (rowSpan=4) */}
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
                  info.year
                )}
              </td>
              <td className="cell-actions3" rowSpan="4">
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
                  <>
                  <button className="btn-edit" onClick={handleEdit}>
                    Edit
                  </button>
                  <button
                    className="btn-refresh"
                    onClick={() => handleRefresh()}
                  >
                    Refresh
                  </button>
                  </>
                )}
              </td>
            </tr>

            {/* Row 2: Registration Open */}
            <tr>
              <td className="cell-label">Registration Open</td>
              <td className="cell-value2">
                {isEditing ? (
                  <select
                    value={draft.registrationOpen ? 'yes' : 'no'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        registrationOpen: e.target.value === 'yes',
                      })
                    }
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                ) : info.registrationOpen ? (
                  <span className="status-open">Yes</span>
                ) : (
                  <span className="status-closed">No</span>
                )}
              </td>
            </tr>

            {/* Row 3: Bracket URL */}
            <tr>
              <td className="cell-label">Bracket URL</td>
              <td className="cell-value2">
                {isEditing ? (
                  <input
                    type="text"
                    className="url-input"
                    value={draft.bracketUrl}
                    placeholder="https://…"
                    onChange={(e) =>
                      setDraft({ ...draft, bracketUrl: e.target.value })
                    }
                  />
                ) : info.bracketUrl ? (
                  <a
                    href={info.bracketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {info.bracketUrl.replace(/^https?:\/\//, '').slice(0, 45) +
                      (info.bracketUrl.length > 45 ? '…' : '')}
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>

            {/* Row 4: Shopify URL */}
            <tr>
              <td className="cell-label">Shopify URL</td>
              <td className="cell-value2">
                {isEditing ? (
                  <input
                    type="text"
                    className="url-input"
                    value={draft.shopifyUrl}
                    placeholder="https://…"
                    onChange={(e) =>
                      setDraft({ ...draft, shopifyUrl: e.target.value })
                    }
                  />
                ) : info.shopifyUrl ? (
                  <a
                    href={info.shopifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {info.shopifyUrl.replace(/^https?:\/\//, '').slice(0, 45) +
                      (info.shopifyUrl.length > 5 ? '…' : '')}
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

