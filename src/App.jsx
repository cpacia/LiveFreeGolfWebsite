import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import TourDetails from './pages/TourDetails';
import Membership from './pages/Membership';
import Courses from './pages/Courses';
import Standings from './pages/Standings';
import Schedule from './pages/Schedule';
import MatchPlay from './pages/MatchPlay';
import DisabledList from './pages/DisabledList';
import ColonyCup from './pages/ColonyCup';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import Results from './pages/Results';
import AdminRoute from './components/AdminRoute';

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
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/disabled-list" element={<DisabledList />} />
          <Route path="/match-play" element={<MatchPlay />} />
          <Route path="/colony-cup" element={<ColonyCup />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/listing/:handle" element={<ProductPage />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin/*" element={<AdminRoute />} />
        </Routes>

        <div className="full-bleed">
          <Footer />
        </div>

        {/* cart drawer should be rendered at root so it can overlay pages */}
        <CartDrawer />
      </BrowserRouter>
  );
}
