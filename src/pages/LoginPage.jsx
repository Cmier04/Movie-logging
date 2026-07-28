import { useAuth0 } from "@auth0/auth0-react"
import { Link } from "react-router-dom";

export default function LoginPage() {
    const { loginWithRedirect } = useAuth0();

    return (
        <main className="login-page">
            <h1>Welcome Back</h1>
            <p>Log in to your account.</p>

            <button onClick={() => loginWithRedirect()}>
                Log In
            </button>

            <p>
                Don't have an account?
                {" "}
                <Link to="/signup">
                    Create an account
                </Link>
            </p>
        </main>
    )
}