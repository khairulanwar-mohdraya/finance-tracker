import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children, isSidebarOpen, setSidebarOpen }) => {
  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setSidebarOpen(!isSidebarOpen)} 
      />
      <main className="main-content">
        <Header />
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 