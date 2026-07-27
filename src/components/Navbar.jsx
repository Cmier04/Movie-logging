import { Link } from "react-router-dom";
import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
    const {
        isAuthenticated,
        loginWithRedirect,
        logout,
    } = useAuth0();

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/">
                    <img src="/src/assets/logo.png" alt="Movie Logger Logo" />
                </a>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/">Home </Link>
                    <Link to="/about">About </Link>
                    {isAuthenticated && (
                        <li>
                            <Link to="/profile">Profile</Link>
                        </li>
                    )}
                </li>
            </ul>

            <div className="auth-buttons">
                {isAuthenticated && (
                    <button
                        onClick={() =>
                        logout({
                            logoutParams: {
                            returnTo: window.location.origin,
                            },
                        })
                        }
                    >
                        Log Out
                    </button>
                )}
            </div>
        </nav>
    );
}