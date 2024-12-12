import React from 'react';
import './Layout.css';

const Sidebar = ({ isOpen, onToggle }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <img src="https://via.placeholder.com/40" alt="Logo" className="logo" />
        <button className="toggle-btn" onClick={onToggle}>
          ☰
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className="active"><a href="#dashboard">Dashboard</a></li>
          <li><a href="#transactions">Transactions</a></li>
          <li><a href="#reports">Reports</a></li>
          <li><a href="#settings">Settings</a></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 