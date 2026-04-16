import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Utensils, Users, UserCircle, Shield, Table2, UtensilsCrossed, LogOut , Receipt  } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeView, userRole }) => {
  const navigate = useNavigate();

  // User section menu items
  const userMenuItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'Order', label: 'Menu', icon: Utensils, path: '/Order' },
    { id: 'Billing', label: 'Billing', icon: Receipt, path: '/Billing' },
  ];

  // Admin section menu items
  const adminMenuItems = [
    { id: 'admin', label: 'Admin ', icon: Shield, path: '/admin' }, 
    // { id: 'users', label: 'Manage Users', icon: Users, path: '/Billing' },
    { id: 'admin-tables', label: 'Table Management', icon: Table2, path: '/admin/table' },
    { id: 'admin-menu', label: 'Menu Management', icon: UtensilsCrossed, path: '/admin/menu' },
    // { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleQuit = () => {

    if (window.confirm('Are you sure you want to quit? All unsaved data will be lost.')) {
      window.location.href = 'about:blank';
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Utensils size={32} color="#3b82f6" />
        <h2 className="sidebar-title">KOT System</h2>
      </div>

      <nav className="nav">
        {/* User Section */}
        <div className="nav-section">
          <div className="section-title">USER MENU</div>
          {userMenuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Admin Section */}
        <div className="nav-section">
          <div className="section-title">ADMIN MENU</div>
          {adminMenuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quit Button at bottom */}
        <div className="quit-button-container">
          <button onClick={handleQuit} className="quit-button">
            <LogOut size={20} />
            <span>Quit Application</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;