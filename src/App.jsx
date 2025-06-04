import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import TourDetails from './pages/TourDetails';
import Membership from './pages/Membership';
import Courses from './pages/Courses';
import Standings from './pages/Standings';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './components/AdminRoute';
import AdminSchedule from './components/AdminSchedule';
import './App.css';

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
        <Route path="/standings" element={<Standings />} />
        <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>

      <div className="full-bleed">
        <Footer />
      </div>
    </BrowserRouter>
  );
}

