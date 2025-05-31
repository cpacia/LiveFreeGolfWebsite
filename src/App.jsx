import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import TourDetails from './pages/TourDetails';
import Membership from './pages/Membership';
import Courses from './pages/Courses';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function AdminRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/auth/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return authenticated ? <AdminPanel /> : <AdminLogin />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="full-bleed">
        <Header />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tour-details" element={<TourDetails />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>

      <div className="full-bleed">
        <Footer />
      </div>
    </BrowserRouter>
  );
}

