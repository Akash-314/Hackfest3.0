import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useScrollReveal } from '../../utils/useScrollReveal';

export default function PublicLayout() {
  const location = useLocation();
  useScrollReveal();

  const isHomepage = location.pathname === '/';

  return (
    <>
      <Navbar />
      <div
        className={`public-content-outlet ${isHomepage ? '' : 'page-route-transition'}`}
        key={isHomepage ? 'home' : location.pathname}
        style={{ position: 'relative', width: '100%' }}
      >
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
