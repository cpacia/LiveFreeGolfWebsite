// src/pages/AdminPanel.jsx
import React from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminSchedule from "../components/AdminSchedule";
import AdminStandings from "../components/AdminStandings";
import AdminChangePassword from "../components/AdminChangePassword";
import AdminDisabledList from "../components/AdminDisabledList";
import AdminMatchPlay from "../components/AdminMatchPlay";
import AdminColonyCup from "../components/AdminColonyCup";
import AdminPlayers from "../components/AdminPlayers";
import AdminChampions from "../components/AdminChampions";
import "./AdminPanel.css";

export default function AdminPanel() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/admin/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="admin-layout full-bleed">
      <nav className="admin-sidebar">
        <h2>Admin</h2>
        <ul>
          <li>
            <Link to="/admin/schedule">Schedule</Link>
          </li>
          <li>
            <Link to="/admin/standings">Standings</Link>
          </li>
          <li>
            <Link to="/admin/match-play">Match Play</Link>
          </li>
          <li>
            <Link to="/admin/players">Players</Link>
          </li>
          <li>
            <Link to="/admin/colony-cup">Colony Cup</Link>
          </li>
          <li>
            <Link to="/admin/past-champions">Past Champions</Link>
          </li>
          <li>
            <Link to="/admin/disabled-list">Disabled List</Link>
          </li>
          <li>
            <Link to="/admin/change-password">Change Password</Link>
          </li>
          <li>
            <Link to="https://lfg-server-production.up.railway.app/api/data-directory">
              Download Backup
            </Link>
          </li>
          <li>
            <Link onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </Link>
          </li>
        </ul>
      </nav>

      <main className="admin-content">
        <div className="admin-inner">
          <Routes>
            {/* If someone hits exactly /admin, show welcome message */}
            <Route
              index
              element={
                <div
                  style={{
                    padding: "0rem",
                    fontSize: "3.25rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  Welcome to the Admin Panel
                  <img style={{ height: "800px" }} src="images/scottie.jpg" />
                </div>
              }
            />

            {/* /admin/schedule */}
            <Route path="schedule" element={<AdminSchedule />} />

            {/* /admin/standings */}
            <Route path="standings" element={<AdminStandings />} />

            {/* /admin/match-play */}
            <Route path="match-play" element={<AdminMatchPlay />} />

            {/* /admin/players */}
            <Route path="players" element={<AdminPlayers />} />

            {/* /admin/colony-cup */}
            <Route path="colony-cup" element={<AdminColonyCup />} />

            {/* /admin/past-champions */}
            <Route path="past-champions" element={<AdminChampions />} />

            {/* /admin/disabled-list */}
            <Route path="disabled-list" element={<AdminDisabledList />} />

            {/* /admin/change-password */}
            <Route path="change-password" element={<AdminChangePassword />} />

            {/* Fallback: any other /admin/* → redirect back to /admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
