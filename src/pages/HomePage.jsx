import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
        fetchTmdbJson,
        getRandomMovies,
        getTopMovies,
        fetchTmdbMovieDetails,
        searchTmdb,
        getMovieRecommendations
    } from "../api.js";

export default function HomePage() {
    // Check if user is logged in
    const {
        loginWithRedirect,
        isAuthenticated,
        logout,
        isLoading,
        error,
    } = useAuth0();

    // Random Movies
    const [randomMovies, setRandomMovies] = useState([]);
    const [moviesLoading, setMoviesLoading] = useState(true);
    // Top 10 Movies
    const [topMovies, setTopMovies] = useState([]);
    const [topMoviesLoading, setTopMoviesLoading] = useState(true);
    // Matchmaking Form
    const [favoriteMovie, setFavoriteMovie] = useState("");
    const [genre, setGenre] = useState("");
    const [length, setLength] = useState("");
    const [matches, setMatches] = useState("");
    const [matchLoading, setMatchLoading] = useState(false);
    const [matchError, setMatchError] = useState("");

    // LOADING... Random and Top Movies
    useEffect(() => {
        async function loadMovies() {
            try {
                const movies = await getRandomMovies();
                // Take 5 random movies
                setRandomMovies(movies);
            } catch (error) {
                console.error("Error loading random movies:", error);
            } finally {
                setMoviesLoading(false);
            }
        }

        async function loadTopMovies() {
            try {
                const movies = await getTopMovies();
                setTopMovies(movies);
            } catch(error) {
                console.error("Error loading top movies", error);
            } finally {
                setTopMoviesLoading(false);
            }
        }
        loadMovies();
        loadTopMovies();
    }, []);

    // MATCHMAKING --- FORM
    async function findMovies(event) {
        event.preventDefault();
        setMatchLoading(true);
        setMatchError("");
        setMatches([]);

        try {
            // Find favorite movie
            const searchResults = await searchTmdb(favoriteMovie);

            if (!searchResults || searchResults.length == 0) {
                throw new Error("Movie not found. Try another movie title.");
            }

            const movieId = searchResults[0].id;

            //Get recommendations based on favorite movie
            const recs = await getMovieRecommendations(movieId);
            // Score recommendations
            const detailedMovies = await Promise.all (recs.slice(0,20).map((movie) => fetchTmdbMovieDetails(movie.id)));

            const scoredMovies = detailedMovies.map((movie) => {
                let score = 0;

                // Genre match
                if (
                    genre &&
                    movie.genres?.some(
                        (movieGenre) =>
                            movieGenre.name === genre
                    )
                ) {
                    score += 5;
                }

                // Length match
                if (
                    length === "short" &&
                    movie.runtime <= 100
                ) {
                    score += 3;
                }

                if (
                    length === "medium" &&
                    movie.runtime > 100 &&
                    movie.runtime <= 140
                ) {
                    score += 3;
                }

                if (
                    length === "long" &&
                    movie.runtime > 140
                ) {
                    score += 3;
                }

                // Rating bonus
                score += movie.vote_average / 10;

                return {
                    ...movie,
                    matchScore: score
                };
            });

            // Highest score first
            scoredMovies.sort(
                (a, b) => b.matchScore - a.matchScore
            );

            // Only show best 3
            setMatches(scoredMovies.slice(0, 3));

        } catch (error) {
            console.error(
                "Error finding movie matches:",
                error
            );

            setMatchError(error.message);
        } finally {
            setMatchLoading(false);
        }
    }

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <div>Oops... {error.message}</div>;
    }

    return (
        <main className="home-page">
            <h1>Welcome to The Movie Logger</h1>
            <p>
                Track your favorite movies, discover new fils, and find your next movie to watch.
            </p>

            {!isAuthenticated && (
                <div className="auth-btns">
                    <button onClick={() => loginWithRedirect()} className="login-btn">
                        Log In
                    </button>

                    <button onClick={()=> loginWithRedirect({
                        authorizationParams: {
                            screen_hint: "Sign Up",
                        },
                    })
                }
                className="signup-btn">
                    Sign Up
                </button>
                </div>
            )}

            {/* =========================
                LOGGED IN
            ========================= */}

            {isAuthenticated && (
                <>
                    <section className="matchmaking">

                        <h2>Find Your Perfect Movie</h2>

                        <form onSubmit={findMovies}>

                            {/* Favorite Movie */}
                            <label>
                                Current Favorite Movie

                                <input type="text" value={favoriteMovie} onChange={(event) =>
                                        setFavoriteMovie(
                                            event.target.value
                                        )
                                    } placeholder="Enter a movie" required
                                />
                            </label>

                            {/* Genre */}
                            <label>Genre
                                <select value={genre} onChange={(event) => setGenre(event.target.value)}required>
                                    <option value="">Choose a genre</option>

                                    <option value="Action">Action</option>

                                    <option value="Adventure">Adventure</option>

                                    <option value="Comedy">
                                        Comedy
                                    </option>

                                    <option value="Drama">
                                        Drama
                                    </option>

                                    <option value="Fantasy">
                                        Fantasy
                                    </option>

                                    <option value="Horror">
                                        Horror
                                    </option>

                                    <option value="Romance">
                                        Romance
                                    </option>

                                    <option value="Science Fiction">
                                        Science Fiction
                                    </option>

                                    <option value="Thriller">
                                        Thriller
                                    </option>
                                </select>
                            </label>


                            {/* Length */}
                            <label>
                                Movie Length

                                <select
                                    value={length}
                                    onChange={(event) =>
                                        setLength(
                                            event.target.value
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Choose a length
                                    </option>

                                    <option value="short">
                                        Short — under 100 minutes
                                    </option>

                                    <option value="medium">
                                        Medium — 100–140 minutes
                                    </option>

                                    <option value="long">
                                        Long — over 140 minutes
                                    </option>
                                </select>
                            </label>


                            <button
                                type="submit"
                                disabled={matchLoading}
                            >
                                {matchLoading
                                    ? "Finding Movies..."
                                    : "Find Movies"}
                            </button>

                        </form>


                        {matchError && (
                            <p className="match-error">
                                {matchError}
                            </p>
                        )}

                    </section>


                    {/* Match Results */}
                    {matches.length > 0 && (
                        <section className="movie-matches">

                            <h2>Your Best Matches</h2>

                            <div className="movie-grid">

                                {matches.map((movie) => (
                                    <div
                                        className="movie-card"
                                        key={movie.id}
                                    >

                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                alt={movie.title}
                                            />
                                        ) : (
                                            <div className="no-poster">
                                                No Poster Available
                                            </div>
                                        )}

                                        <h3>{movie.title}</h3>

                                        <p>
                                            ⭐{" "}
                                            {movie.vote_average?.toFixed(1)}
                                        </p>

                                        <p>
                                            {movie.runtime} minutes
                                        </p>

                                    </div>
                                ))}

                            </div>

                        </section>
                    )}
                </>
            )}

            {/* LOGGED OUT */}
            {!isAuthenticated && (
                <>
                <section className="random-movies">
                    <h2>Random Movies</h2>
                        {moviesLoading ? (
                            <p>Loading movies...</p>
                        ) : (
                            <div className="movie-grid">
                                {randomMovies.map((movie) => (
                                    <div className="movie-card" key={movie.id}>
                                        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                                        <h3>{movie.title}</h3>

                                        <p>⭐{movie.vote_average.toFixed(1)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                </section>
            </>
            )}

            <section className="top-movies">
                <h2>Top 10 Movies</h2>

                {topMoviesLoading ? (
                    <p>Loading top movies...</p>
                ) : (
                    <div className="movie-grid">
                        {topMovies.map((movie, index) => (
                            <div className="movie-card" key={movie.id}>
                                <p className="movie-rank">
                                    #{index + 1}
                                </p>

                                {movie.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                    />
                                ) : (
                                    <div className="no-poster">
                                        No Poster Available
                                    </div>
                                )}

                                <h3>{movie.title}</h3>

                                <p>
                                    ⭐ {movie.vote_average.toFixed(1)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
                
        </main>
    );
}