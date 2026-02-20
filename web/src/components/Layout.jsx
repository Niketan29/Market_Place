import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="app-header">
        <div className="header-left">
          <span className="header-brand">Micro Marketplace</span>
        </div>
        <nav className="header-nav">
          <NavLink to="/products" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-bag-shopping" />
            <span>Products</span>
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <i className="fa-solid fa-heart" />
            <span>Favorites</span>
          </NavLink>
        </nav>
        <div className="header-right">
          {user && <span className="header-user">Hi, {user.name?.split(' ')[0]}</span>}
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <nav className="tab-bar">
        <NavLink to="/products" className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-bag-shopping" />
          <span>Products</span>
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-heart" />
          <span>Favorites</span>
        </NavLink>
      </nav>
    </div>
  )
}
