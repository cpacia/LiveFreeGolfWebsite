// AdminSchedule.jsx
import React from 'react';
import './AdminSchedule.css';

export default function AdminSchedule() {
  return (
    <>
      {/* Page Header */}
      <div className="schedule-header">
        <h1>Schedule – 2025</h1>
        <button className="btn-add-event">Add Event</button>
      </div>

      {/* Container for all event cards */}
      <div className="schedule-cards">
        <div className="card">
          {/* ─────────────────────── Column 1: Thumbnail ─────────────────────── */}
          <div className="col-image">
            <img
              src="/images/default-image.webp"
              alt="Spring Classic thumbnail"
              className="thumbnail"
            />
          </div>

          {/* ─────────────────────── Column 2: Details ─────────────────────── */}
          <div className="col-details">
            {/* Row 1: Title */}
            <div className="row-title">
              <h3 className="event-title">Spring Classic</h3>
            </div>

            {/* Row 2: Date | Location */}
            <div className="row-subtitle">
              <span className="icon">📅</span>
              <span className="subtitle-text">2025‑04‑15</span>
              <span className="separator">|</span>
              <span className="icon">📍</span>
              <span className="subtitle-text">
                Whispering Pines, Greenville, TX
              </span>
            </div>

            {/* Row 3: Badges */}
            <div className="row-badges">
              <span className="badge badge-secondary">80% Handicap</span>
              <span className="badge badge-success">Open Registration</span>
              <span className="badge badge-danger">Incomplete</span>
            </div>
          </div>

          {/* ─────────────────────── Column 3: Links ─────────────────────── */}
          <div className="col-links">
            <div className="links-header">
              <strong>Links:</strong>
            </div>
            <div className="links-list">
              <div className="link-item">
                <span className="link-label">Net:</span>
                <a
                  href="https://bluegolf.com/net"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bluegolf.com/net
                </a>
              </div>
              <div className="link-item">
                <span className="link-label">Gross:</span>
                <a
                  href="https://bluegolf.com/gross"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bluegolf.com/gross
                </a>
              </div>
              <div className="link-item">
                <span className="link-label">Skins:</span>
                <a
                  href="https://bluegolf.com/skins"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bluegolf.com/skins
                </a>
              </div>
              <div className="link-item">
                <span className="link-label">Teams:</span>
                <a
                  href="https://bluegolf.com/teams"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bluegolf.com/teams
                </a>
              </div>
              <div className="link-item">
                <span className="link-label">WGR:</span>
                <a
                  href="https://bluegolf.com/wgr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bluegolf.com/wgr
                </a>
              </div>
              <div className="link-item">
                <span className="link-label">BlueGolf:</span>
                <a
                  href="https://bluegolf.com/spring-classic"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bluegolf.com/spring-classic
                </a>
              </div>
            </div>
          </div>

          {/* ─────────────────────── Column 4: Buttons ─────────────────────── */}
          <div className="col-actions">
            <button className="btn-edit">Edit</button>
            <button className="btn-delete">Delete</button>
          </div>
        </div>

        {/* Repeat <div className="card">…</div> for each event */}
      </div>
    </>
  );
}

