import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo-text">Point</span>
      </div>
      
      <ul className="navbar-links">
        <li>
          <NavLink 
            to="/aluno" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <GraduationCap size={22} />
            <span className="link-text">Área do Aluno</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/coordenador" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <LayoutDashboard size={22} />
            <span className="link-text">Coordenação</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;