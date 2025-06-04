// src/components/AdminDisabledList.jsx
import React, { useState, useEffect } from 'react';
import './AdminDisabledList.css'; 

export default function AdminDisabledList() {
  // ─── 1) State Hooks ──────────────────────────────────────────────
  const [golfers, setGolfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null); // which card is in edit mode
  const [draft, setDraft] = useState(null);         // draft copy of the golfer being edited
  const [newCount, setNewCount] = useState(0);      // for generating temporary IDs

  // ─── 2) Fetch existing disabled golfers on mount ─────────────────
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/disabled-golfers', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Expect data = [ { ID, name, reason, duration, … }, … ]
        if (Array.isArray(data)) {
          const normalized = data.map((row) => ({
            id: row.ID || row.id,
            name: row.name,
            reason: row.reason,
            duration: row.duration,
            cacheKey: Date.now(),
          }));
          setGolfers(normalized);
        } else {
          setGolfers([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching disabled golfers:', err);
        setError(err.message || 'Unknown error');
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── 3) Loading / Error States ───────────────────────────────────
  if (loading) {
    return (
      <div className="standings-header">
        <h1>Disabled List</h1>
        <button className="btn-add-standing">Add Golfer</button>
        <p>Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="standings-header">
        <h1>Disabled List</h1>
        <button className="btn-add-standing">Add Golfer</button>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  // ─── 4) “Add Golfer” Handler ───────────────────────────────────────
  const handleAddGolf = () => {
    const tempId = `__new__${newCount + 1}`;
    setNewCount((n) => n + 1);

    // Blank placeholder
    const blank = {
      id: tempId,
      name: '',
      reason: '',
      duration: '',
      cacheKey: Date.now(),
    };

    setGolfers((prev) => [blank, ...prev]);
    setEditingId(tempId);
    setDraft(blank);
  };

  // ─── 5) Save (POST or PUT) with error dialog ───────────────────────
  const handleSave = () => {
    if (!draft) return;

    // Basic client‐side check: name must not be empty
    if (!draft.name.trim()) {
      window.alert('Name cannot be empty.');
      return;
    }

    const isNew = String(draft.id).startsWith('__new__');
    const url = 'http://localhost:8080/disabled-golfers/' + draft.name;
    const method = isNew ? 'POST' : 'PUT';

    // Build payload: for PUT include { ID: draft.id }
    const payload = {
      ...(isNew ? {} : { ID: draft.id }),
      name: draft.name,
      reason: draft.reason,
      duration: draft.duration,
    };

    fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          // Show server‐sent error text if available
          throw new Error(text || `HTTP ${res.status}`);
        }
        // If body is empty, return null; otherwise parse JSON
        return text ? JSON.parse(text) : null;
      })
      .then((returned) => {
        // On success, returned is the new/updated row (with .ID)
        const saved = returned
          ? {
              id: returned.ID || returned.id,
              name: returned.name,
              reason: returned.reason,
              duration: returned.duration,
              cacheKey: Date.now(),
            }
          : null;

        setGolfers((prev) => {
          if (isNew) {
            // Remove all placeholders and prepend the real saved row
            const filtered = prev.filter(
              (r) => !String(r.id).startsWith('__new__')
            );
            return saved ? [saved, ...filtered] : filtered;
          } else if (saved) {
            // Replace the existing row in place
            return prev.map((r) => (r.id === saved.id ? saved : r));
          }
          return prev;
        });

        setEditingId(null);
        setDraft(null);
      })
      .catch((err) => {
        console.error('Save failed:', err);
        window.alert(`Error saving golfer: ${err.message}`);
      });
  };

  // ─── 6) Cancel Editing ────────────────────────────────────────────
  const handleCancel = (row) => {
    const isNew = String(row.id).startsWith('__new__');
    if (isNew) {
      // Remove the placeholder completely
      setGolfers((prev) => prev.filter((r) => r.id !== row.id));
    }
    setEditingId(null);
    setDraft(null);
  };

  // ─── 7) Delete (with confirmation) ─────────────────────────────────
  const handleDelete = (row) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${row.name}" from the disabled list?`
      )
    ) {
      return;
    }

    // Send DELETE with JSON { name: row.name }
    fetch('http://localhost:8080/disabled-golfers/'+row.name, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: row.name }),
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(text || `HTTP ${res.status}`);
        }
        // Remove from state on success
        setGolfers((prev) => prev.filter((r) => r.name !== row.name));
      })
      .catch((err) => {
        console.error('Delete failed:', err);
        window.alert(`Error deleting golfer: ${err.message}`);
      });
  };

  // ─── 8) Main Render ──────────────────────────────────────────────
  return (
    <div className="disabled-list-page">
      {/* Page Header */}
      <div className="standings-header">
        <h1>Disabled List</h1>
        <button className="btn-add-standing" onClick={handleAddGolf}>
          Add Golfer
        </button>
      </div>

      {golfers.length === 0 ? (
        <p>No disabled golfers found.</p>
      ) : (
        golfers.map((row) => {
          const isEditing = editingId === row.id;

          return (
            <div
              className={`card-table-container card-table-width2 ${
                isEditing ? 'editing' : ''
              }`}
              key={row.id + '_' + row.cacheKey}
            >
              {/* ─── Card Header: always display the golfer’s name (or blank) ───────── */}
              <div className="card-table-header card-table-header-width2">
                {row.name || 'New Golfer'}
              </div>

              {/* ─── Table Body: Name, Reason, Duration + Actions ─────────────────── */}
              <table className="standings-table">
                <tbody>
                  {/* Row 1: Name + Actions (rowSpan=3) */}
                  <tr>
                    <td className="cell-label">Name</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="cell-input"
                          value={draft.name}
                          onChange={(e) =>
                            setDraft({ ...draft, name: e.target.value })
                          }
                          placeholder="Golfer Name"
                        />
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className="cell-actions3" rowSpan="3">
                      {isEditing ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={handleSave}
                          >
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
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Reason */}
                  <tr>
                    <td className="cell-label">Reason</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="cell-input"
                          value={draft.reason}
                          onChange={(e) =>
                            setDraft({ ...draft, reason: e.target.value })
                          }
                          placeholder="Why disabled?"
                        />
                      ) : (
                        row.reason
                      )}
                    </td>
                  </tr>

                  {/* Row 3: Duration */}
                  <tr>
                    <td className="cell-label">Duration</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="cell-input"
                          value={draft.duration}
                          onChange={(e) =>
                            setDraft({ ...draft, duration: e.target.value })
                          }
                          placeholder="e.g. 2 weeks"
                        />
                      ) : (
                        row.duration
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}

