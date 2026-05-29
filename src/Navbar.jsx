// src/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="top-nav">
      <NavLink
        to="/tracker"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Tracker
      </NavLink>

      <NavLink
        to="/todo"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        ToDo
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/month-view"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Month View
      </NavLink>

      <NavLink
        to="/setup"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Setup
      </NavLink>
    </nav>
  );
}
