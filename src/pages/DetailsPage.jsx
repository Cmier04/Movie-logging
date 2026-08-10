/*TODO: 
    1. add links to genres pages (displays all movies in that genre)
    2. add links to directors and actors pages (small bio and works/roles), include follow button
    3. implement favorites
    4. implement reviews/threads
*/

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useFavorites from "../hooks/useFavorites";
import {
    fetchTmdbCertification,
    fetchTmdbMovieDetails,
    getTmdbMovieCredits,
    //getTmdbMovieReviews
    fetchTmdbMovieGenres,
    formatRuntime,
    formatDate
} from "../api";
import "../css/DetailsPage.css";

export default function DetailsPage() {
    const [searchParams] = useSearchParams();
    const movieId = searchParams.get("id");
    const [movie, setMovie] = useState(null);
    const [credits, setCredits] = useState([]);
    const [certification, setCertification] = useState("NR");
    const [showAllCast, setShowAllCast] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const [showAllCrew, setShowAllCrew] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadMovieDetails() {
            if (!movieId) {
                setError("No movie ID was provided");
                setLoading(false);
                return;
            }

            try {
                const [movieData, creditsData, certificationData] = await Promise.all([
                    fetchTmdbMovieDetails(movieId),
                    getTmdbMovieCredits(movieId),
                    //getTmdbMovieReviews(movieId)
                    fetchTmdbCertification(movieId)
                ]);
                setMovie(movieData);
                setCredits(creditsData);
                //setReviews(reviewsData);
                setCertification(certificationData);

            } catch (error) {
                console.error("Error loading movie details:", error);
                setError("Unable to load movie details");
            } finally {
                setLoading(false);
            }
        }
        loadMovieDetails();
    }, [movieId]);

    if (loading) {
        return (
            <main className="details-page">
                <p>Loading movie...</p>
            </main>
        );
    }
    if (error) {
        return (
            <main className="details-page">
                <p>{error}</p>
            </main>
        );
    }
    if (!movie) {
        return (
            <main className="details-page">
                <p>Movie not found.</p>
            </main>
        );
    }
    const cast = credits?.cast || [];
    const crew = credits?.crew || [];

    const directors = crew.filter( person => person.job === "Director");

    const leadCast = cast.slice(0, 5);
    const displayedCast = showAllCast ? cast : leadCast;

    const leadCrew = crew.slice(0, 5);
    const displayedCrew = showAllCrew
        ? crew
        : leadCrew;

    return (
        <main className="details-page">
            <Link to="/search" className="back-button">Back to Search</Link>

            <section className="movie-details">

                <aside className="movie-sidebar">
                    <div className="details-poster">
                        <img src={movie.image} alt={movie.title} />

                        <button className={`favorite-btn ${isFavorite(movie.id) ? "is-favorite" : ""}`}
                            onClick={() => toggleFavorite(movie.id)}
                            aria-label= {
                                isFavorite(movie.id)
                                    ? "Remove from Favorites"
                                    : "Add to Favorites"
                            }
                        >
                           {isFavorite(movie.id) ? "♥" : "♡"}
                        </button>
                    </div>

                    <div className="movie-stats">
                        <p>
                            <strong>Vote Average: </strong>{movie.rating || "N/A"}
                        </p>
                        <p>
                            <strong>Favorite Count: </strong>
                            0
                        </p>
                        
                        <div className="genres">
                            {movie.genres?.map((genre) => (
                                <span key={genre.id} className="genre-tag">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="movie-info">
                    {/* TITLE + Movie Details */}
                    <div className="movie-overview">
                        <h1>{movie.title}</h1>
                        <div className="movie-meta">
                            <span>
                                {directors.length > 0 
                                ? directors.map(person => person.name).join(", ")
                                : "Unknown"}
                            </span>

                            <span>
                                {formatDate(movie.releaseDate)}
                            </span>

                            <span>
                                {certification || "NR"}
                            </span>
                            
                            <span>
                                {formatRuntime(movie.runtime)}
                            </span>
                        </div>

                        <span className="overview-summary">
                            <h2>Overview</h2>
                            <p>
                                {movie.summary}
                            </p>
                        </span>
                    </div>
                </div>
            </section>

            <section className="cast-section">
                <h2>Cast</h2>

                <div className="cast-list">
                    {displayedCast.map(person => (
                        <div className="cast-member" key={person.credit_id || person.id}>
                        
                        {person.profile_path ? (
                            <img 
                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                alt={person.name} />
                        ) : (
                            <div className="cast-placeholder">No Photo available</div>
                        )}
                        <h3>{person.name}</h3>
                        <p>{person.character || "Unknown role"}</p>
                        </div>
                    ))}
                </div>

                {cast.length > leadCast.length && (
                    <button className="cast-toggle-btn" onClick={() =>
                        setShowAllCast(!showAllCast) } >
                        {showAllCast ? "Show Lead Cast" : "Show All Cast"}
                        {" "}
                        {showAllCast ? "▲" : "▼"}
                    </button>
                    )}
            </section>

            <section className="crew-section">
                <h2>Crew</h2>

                <div className="crew-list">
                    {displayedCrew.map(person => (
                        <div className="crew-member" key={person.credit_id || person.id} >
                            {person.profile_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                    alt={person.name}
                                />
                            ) : (
                                <div className="crew-placeholder">
                                    No Photo Available
                                </div>
                            )}
                            <h3>{person.name}</h3>
                            <p>{person.job || "Unknown role"}</p>
                        </div>
                    ))}
                </div>

                {crew.length > leadCrew.length && (
                    <button className="crew-toggle-btn" onClick={() => setShowAllCrew(!showAllCrew)}>
                        {showAllCrew ? "Show Main Crew" : "Show All Crew"}
                    </button>
                )}
            </section>
            
        </main>
    )
}
