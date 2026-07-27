import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
    const {
        isAuthenticated,
        loginWithRedirect,
        logout,
    } = useAuth0();

    const location = useLocation();
    // Check if user is on homePage
    const isHome = location.pathname === "/"

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
        </nav>
    );
}