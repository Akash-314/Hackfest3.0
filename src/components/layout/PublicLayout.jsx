import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <div className="public-content-outlet" style={{ position: 'relative', width: '100%' }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
