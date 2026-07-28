import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    fetchTmdbMovieDetails,
    getTmdbMovieCredits,
    //getTmdbMovieReviews
} from "../api";
import "../css/DetailsPage.css";

export default function DetailsPage() {
    const [searchParams] = useSearchParams();
    const movieId = searchParams.get("id");
    const [movie, setMovie] = useState(null);
    const [credits, setCredits] = useState([]);
    const [showAllCast, setShowAllCast] = useState(false);
    
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
                const [movieData, creditsData, reviewsData] = await Promise.all([
                    fetchTmdbMovieDetails(movieId),
                    getTmdbMovieCredits(movieId)
                    //getTmdbMovieReviews(movieId)
                ]);
                setMovie(movieData);
                setCredits(creditsData);
                //setReviews(reviewsData);
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
    const producors = crew.filter(person => person.job === "Producer");
    const leadCast = cast.slice(0, 5);
    const displayedCast = showAllCast ? cast : leadCast;

    return (
        <main className="details-page">
            <Link to="/search" className="back-button">Back to Search</Link>

            <section className="movie-details">
                <div className="details-poster">
                    {movie.poster_path ? (
                        <img 
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={`${movie.title} poster`}
                        />
                    ) : (
                        <div className="details-poster-placeholder">
                            No Poster Available.
                        </div>
                    )}
                </div>
                <div className="details-content">
                    <h1>{movie.title}</h1>
                    <div className="movie-info">
                        <p>
                            <strong>Director: </strong>
                            {directors.length > 0 ? directors.map(person => person.name).join(", ") : "Unknown"}
                        </p>

                        <p>
                            <strong>Release Date: </strong>{movie.release_date || "Unknown"}
                        </p>
                        <p>
                            <strong>Vote Average: </strong>{movie.vote_average?.toFixed(1) || "N/A"}
                        </p>
                        <p>
                            <strong>Vote Count: </strong>{movie.vote_count?.toLocaleString() || "0"}
                        </p>
                        <p>
                            <strong>Rating: </strong>{movie.rating || "Unknown"}
                        </p>
                        <p>
                            <strong>Favorite Count: </strong>
                            0
                        </p>
                    </div>

                    <div className="movie-overview">
                        <h2>Overview</h2>

                        <p>
                            {movie.overview || "No summary is available."}
                        </p>
                    </div>

                    <button className="favorite-btn">♡ Add to Favorites</button>
                </div>
            </section>

            <section className="cast-section">
                <h2>Cast</h2>
                <div className="class-list">
                    {displayedCast.map(person => (
                        <div className="cast-member" key={person.credit_id || person.id}>
                        
                        {person.profile_path ? (
                            <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} />
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
            
        </main>
    )
}
