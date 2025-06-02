// src/pages/AdminPanel.jsx
import React from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import AdminSchedule from '../components/AdminSchedule'; // import schedule component
import './AdminPanel.css';

export default function AdminPanel() {
  return (
    <div className="admin-layout full-bleed">
      <nav className="admin-sidebar">
        <h2>Admin</h2>
        <ul>
          <li><Link to="/admin/schedule">Schedule</Link></li>
          <li><Link to="/admin/standings">Standings</Link></li>
          <li><Link to="/admin/match-play">Match Play</Link></li>
          <li><Link to="/admin/colony-cup">Colony Cup</Link></li>
          <li><Link to="/admin/disabled-list">Disabled List</Link></li>
          <li><Link to="/admin/change-password">Change Password</Link></li>
          <li><Link to="/admin/logout"><i class="fas fa-sign-out-alt"></i> Logout</Link></li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="admin-inner">
          <Routes>
            {/* If someone hits exactly /admin, show welcome message */}
            <Route
              index
              element={
                <div style={{ padding: '2rem', fontSize: '1.25rem' }}>
                  Welcome to the Admin Panel
                </div>
              }
            />

            {/* /admin/schedule */}
            <Route path="schedule" element={<AdminSchedule />} />

            {/* /admin/standings */}
            <Route
              path="standings"
              element={<div>Standings component goes here</div>}
            />

            {/* /admin/match-play */}
            <Route
              path="match-play"
              element={<div>Match Play component goes here</div>}
            />

            {/* /admin/colony-cup */}
            <Route
              path="colony-cup"
              element={<div>Colony Cup component goes here</div>}
            />

            {/* /admin/disabled-list */}
            <Route
              path="disabled-list"
              element={<div>Disabled List component goes here</div>}
            />

            {/* /admin/change-password */}
            <Route
              path="change-password"
              element={<div>Change Password component goes here</div>}
            />

            {/* /admin/logout */}
            <Route
              path="logout"
              element={<div>Logout logic goes here</div>}
            />

            {/* Fallback: any other /admin/* → redirect back to /admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

