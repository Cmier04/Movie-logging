import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import {
    PieChart,
    Pie,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import { getTopRatedGenreData } from "../api.js";

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth0();

    const [genreData, setGenreData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadGenreData() {
            try {
                setLoading(true);
                setError("");

                const data = await getTopRatedGenreData();

                console.log("Top rated genre data:", data);

                setGenreData(data);

            } catch (error) {
                console.error(
                    "Error loading top rated genres:",
                    error
                );

                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated) {
            loadGenreData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <main className="profile-page">
                <h1>Please Log In</h1>
                <p>
                    You need to be logged in to view your profile.
                </p>
            </main>
        );
    }

    return (
        <main className="profile-page">

            <section className="profile-header">
                {user?.picture && (
                    <img
                        src={user.picture}
                        alt="Profile"
                        className="profile-picture"
                    />
                )}

                <div>
                    <h1>{user?.name}</h1>
                    <p>{user?.email}</p>
                </div>
            </section>


            <section className="profile-chart">

                <h2>TMDB Top Rated Movie Categories</h2>

                <p>
                    The most common genres among TMDB's
                    top-rated movies.
                </p>

                {loading && (
                    <p>Loading chart...</p>
                )}

                {error && (
                    <p className="error">
                        Error: {error}
                    </p>
                )}

                {!loading && !error && genreData.length === 0 && (
                    <p>
                        No genre data was found.
                    </p>
                )}

                {!loading && !error && genreData.length > 0 && (
                    <div
                        className="chart-container"
                        style={{
                            width: "100%",
                            height: "400px"
                        }}
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <PieChart>

                                <Pie
                                    data={genreData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={140}
                                    label
                                />

                                <Tooltip />

                                <Legend />

                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

            </section>


            <section className="user-chart">

                <h2>Your Movie Categories</h2>

                <p>
                    Your personal movie statistics will appear
                    here once you start logging movies.
                </p>

                <div className="empty-chart">
                    <p>No movie history yet.</p>
                </div>

            </section>

        </main>
    );
}