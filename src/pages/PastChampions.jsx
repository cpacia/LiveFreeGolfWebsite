// src/components/PastChampions.jsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format, parseISO } from "date-fns";
import { getImageUrl } from "../lib/api";
import "../components/AdminSchedule.css";
import "./Standings.css"; // includes .modal / .modal-backdrop base styles
import "./PastChampions.css";

export default function PastChampions() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalRows, setModalRows] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedChampion, setSelectedChampion] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("/api/champions", { cache: "no-store" });
        if (resp.status === 404) { setChampions([]); return; }
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const list = Array.isArray(data) ? data : data.champions || [];
        const sorted = [...list].sort((a, b) => Number(b.year) - Number(a.year));
        setChampions(sorted);
      } catch (e) {
        console.error(e);
        setError("Failed to load champions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openSeasonModal = async (champ) => {
    if (!champ) return;
    setSelectedChampion(champ);
    setModalTitle(`${champ.player} — ${champ.year} Season Results`);
    setModalRows([]);
    setModalError(null);
    setModalLoading(true);
    setModalOpen(true);
    try {
      const endpoint = `/api/standings-data/season/${encodeURIComponent(
        champ.player
      )}?year=${encodeURIComponent(champ.year)}`;
      const resp = await fetch(endpoint);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const rows = await resp.json();
      setModalRows(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error(e);
      setModalError("Failed to load season results.");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <div className="content-container"><p>Loading…</p></div>;
  if (error) return <div className="content-container"><p className="error-text">{error}</p></div>;

  if (!champions || champions.length === 0) {
    return (
      <div className="content-container">
        <h1>Past Champions</h1>
        <p>No champions have been recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="champion-content-section full-bleed">
      <div className="content-container">
        <h1>Past Champions</h1>
        <div className="pc-list">
          {champions.map((c) => (
            <article key={c.year} className="pc-hero">
              <div className="pc-hero-media">
                <img
                  src={getImageUrl(`/api/champions/${c.year}/image`)}
                  alt={`${c.year} Champion ${c.player}`}
                  className="pc-hero-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/default-image.webp";
                  }}
                />
              </div>

              <div className="pc-hero-body">
                <div className="pc-eyebrow">{c.year} CHAMPION</div>
                <h2 className="pc-title">{c.player}</h2>
                <p className="pc-blurb">
                  The {c.year} season crowned {c.player} as our tour champion. Click below to view the full tournament-by-tournament breakdown of their season.
                </p>
                <div className="pc-actions">
                  <button className="pc-btn" onClick={() => openSeasonModal(c)}>
                    View Season Results
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Portal-mounted modal so it sits above header/footer */}
      {modalOpen && createPortal(
        <div className="modal-backdrop pc-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal pc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pc-season-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="pc-season-title">{modalTitle}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">×</button>
            </div>

            <div className="modal-body">
              {modalLoading && <p className="loading-text">Loading…</p>}
              {modalError && <p className="error-text">{modalError}</p>}
              {!modalLoading && !modalError && (
                <table className="modal-table details-table">
                  <thead>
                    <tr>
                      <th><span className="full-header">Date</span><span className="abbr-header">Date</span></th>
                      <th></th>
                      <th><span className="full-header">Tournament</span><span className="abbr-header">Tournament</span></th>
                      <th><span className="full-header">Score</span><span className="abbr-header">Scr</span></th>
                      <th><span className="full-header">Place</span><span className="abbr-header">Pl</span></th>
                      <th><span className="full-header">Points</span><span className="abbr-header">Pts</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalRows.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: "center" }}>No results.</td></tr>
                    ) : (
                      modalRows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.date ? format(parseISO(r.date), "MMM d") : "—"}</td>
                          <td>{r.usedInCalc ? "*" : ""}</td>
                          <td>{r.name ?? "—"}</td>
                          <td>{r.score ?? "—"}</td>
                          <td>{r.place ?? "—"}</td>
                          <td>{r.points ?? "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

