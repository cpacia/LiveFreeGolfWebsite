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
            {/* Row 3: Status Indicators */}
	 <div className="row-status">
	   {/* 1) Handicap */}
	   <div className="status-item">
	     <span className="status-label">Handicap:</span>
	     <span className="status-value">80%</span>
	   </div>

	   {/* 2) Registration (Open -> green check, Closed -> red X) */}
	   <div className="status-item">
	     <span className="status-label">Registration:</span>
	     {/* If “open” */}
	     <span className="status-value status-open">✓ Open</span>
	     {/* If “closed,” you’d render instead:
		 <span className="status-value status-closed">✗ Closed</span>
	     */}
	   </div>

	   {/* 3) Complete (No -> red X, Yes -> green check) */}
	   <div className="status-item">
	     <span className="status-label">Complete:</span>
	     {/* If not complete */}
	     <span className="status-value status-closed">✗ No</span>
	     {/* If complete, use:
		 <span className="status-value status-open">✓ Yes</span>
	     */}
	   </div>
	</div>
          </div>

          {/* ─────────────────────── Column 3: Links ─────────────────────── */}
          <div className="col-links">
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

