import React from 'react';
import './Layout.css';

const Header = () => {
  return (
    <header className="top-header">
      <div className="header-left">
        <h1>Finance Tracker</h1>
      </div>
      <div className="header-right">
        <div className="search-bar">
          <input type="search" placeholder="Search transactions..." />
        </div>
        <div className="user-profile">
          <img src="https://via.placeholder.com/32" alt="Profile" className="profile-pic" />
          <div className="profile-menu">
            <span>John Doe</span>
            <button className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 