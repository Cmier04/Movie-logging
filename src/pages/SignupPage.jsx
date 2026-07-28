import { useAuth0 } from "@auth0/auth0-react"

export default function SignupPage() {
    const { loginWithRedirect } = useAuth0();

    return (
        <main className="signup-page">
            <h1>Create Account</h1>

            <p>Join The Movie Log!</p>
            <button onClick={() => loginWithRedirect({
                authorizationParams: {
                    screen_hint: "signup"
                }
            })}
            >Create Account</button>
        </main>
    );
}