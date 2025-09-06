import React, { useState, useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import MenuDashboard from '../components/MenuDashboard';
import '../menu-dashboard.css';

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const iconoMenuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="dashboard" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Botón toggle flotante para abrir/cerrar menú */}
      <div className="toggle" onClick={toggleMenu} style={{ position: 'fixed', top: 100, left: 24, zIndex: 300, background: '#1a1a1a', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', cursor: 'pointer' }}>
        <i
          className={`bx ${menuOpen ? 'bx-x' : 'bx-menu'}`}
          ref={iconoMenuRef}
          style={{ fontSize: 28, color: '#fff' }}
        >=</i>
      </div>
      <MenuDashboard menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main style={{ flex: 1, marginLeft: -50, width: '100%', position: 'absolute', padding: 50 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
