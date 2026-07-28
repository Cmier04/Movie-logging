import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

export default function Navbar() {
    const {
        isAuthenticated,
        loginWithRedirect,
        logout,
    } = useAuth0();

    // Search capabilities
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const location = useLocation();
    // Check if user is on homePage
    const isHome = location.pathname === "/"

    function handleSearch(e) {
        e.preventDefault();

        const trimmedQuery = query.trim();
        
        if (!trimmedQuery) return;

        navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    }

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/">
                    The Movie Log
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
                {/* Show Login and Signup when user is NOT on HomePage */}
                {!isHome && !isAuthenticated && (
                    <>
                        <button onClick={() => loginWithRedirect()}>Log In</button>
                        <button onClick={() => loginWithRedirect({
                            authorizationParams: { screen_hint: "signup",},})}>
                            Sign Up
                        </button>
                    </>
                )}

                {isAuthenticated && (
                    <button onClick={() => logout({
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

            {/* Search Bar */}
            <form onSubmit={handleSearch}>
                <input
                    type="search"
                    placeholder="Search movies..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                <button type="submit">Search</button>
            </form>
        </nav>
    );
}