// AdminSchedule.jsx
import React from 'react';
import './AdminSchedule.css';

export default function AdminSchedule() {
  return (
    <>
      {/* Page header with title + “Add Event” button */}
      <div className="schedule-header">
        <h1>Schedule – 2025</h1>
        <button className="btn-add-event">Add Event</button>
      </div>

      {/* ─────────────────────────────────────────────────────────
          Card rendered as a “table” with a green header bar
      ───────────────────────────────────────────────────────── */}
      <div className="card-table-container">
        {/* 1) GREEN HEADER BAR */}
        <div className="card-table-header">
          Spring Classic
        </div>

        {/* 2) TABLE BODY */}
        <table className="event-table">
          <tbody>
            {/* Row 1: Date | Registration Open | Skins URL | Edit Button */}
            <tr>
              {/* Image spans all five rows */}
              <td className="cell-image" rowSpan="5">
                <img
                  src="/images/default-image.webp"
                  alt="Spring Classic thumbnail"
                  className="event-thumbnail"
                />
              </td>

              <td className="cell-label">Date</td>
              <td className="cell-value">2025‑04‑15</td>

              <td className="cell-label">Registration</td>
              <td className="cell-value status-open">Open</td>

              <td className="cell-label">Skins URL</td>
              <td className="cell-value">
                <a href="https://bluegolf.com/skins" target="_blank" rel="noopener noreferrer">
                  bluegolf.com/skins
                </a>
              </td>

              {/* Edit button only in row 1 */}
              <td className="cell-actions" rowSpan="5">
                <button className="btn-edit">Edit</button>
                <button className="btn-delete">Delete</button>
              </td>
            </tr>

            {/* Row 2: Course | Complete | Teams URL */}
            <tr>
              <td className="cell-label">Course</td>
              <td className="cell-value">Whispering Pines</td>

              <td className="cell-label">Complete</td>
              <td className="cell-value status-closed">No</td>

              <td className="cell-label">Teams URL</td>
              <td className="cell-value">
                <a href="https://bluegolf.com/teams" target="_blank" rel="noopener noreferrer">
                  bluegolf.com/teams
                </a>
              </td>
            </tr>

            {/* Row 3: Town | BlueGolf URL | WGR URL */}
            <tr>
              <td className="cell-label">Town</td>
              <td className="cell-value">Greenville</td>

              <td className="cell-label">BlueGolf URL</td>
              <td className="cell-value">
                <a href="https://bluegolf.com/spring-classic/some-ling-url/contest/19" target="_blank" rel="noopener noreferrer">
                  bluegolf.com/spring-classic/some-ling-url/contest/19
                </a>
              </td>

              <td className="cell-label">WGR URL</td>
              <td className="cell-value">
                <a href="https://bluegolf.com/wgr" target="_blank" rel="noopener noreferrer">
                  bluegolf.com/wgr
                </a>
              </td>
            </tr>

            {/* Row 4: State | Net URL */}
            <tr>
              <td className="cell-label">State</td>
              <td className="cell-value">TX</td>

              <td className="cell-label">Net URL</td>
              <td className="cell-value">
                <a href="https://bluegolf.com/net" target="_blank" rel="noopener noreferrer">
                  bluegolf.com/net
                </a>
              </td>

              {/* Empty cells to keep the 7‑cell structure */}
              <td className="cell-label">&nbsp;</td>
              <td className="cell-value">&nbsp;</td>
            </tr>

            {/* Row 5: Handicap | Gross URL */}
            <tr>
              <td className="cell-label">Handicap</td>
              <td className="cell-value">80%</td>

              <td className="cell-label">Gross URL</td>
              <td className="cell-value">
                <a href="https://bluegolf.com/gross" target="_blank" rel="noopener noreferrer">
                  bluegolf.com/gross
                </a>
              </td>

              {/* Empty cells for alignment */}
              <td className="cell-label">&nbsp;</td>
              <td className="cell-value">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}


