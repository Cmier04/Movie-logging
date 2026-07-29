import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    fetchTmdbCertification,
    fetchTmdbMovieDetails,
    getTmdbMovieCredits,
    //getTmdbMovieReviews
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
    const producors = crew.filter(person => person.job === "Producer");
    const leadCast = cast.slice(0, 5);
    const displayedCast = showAllCast ? cast : leadCast;

    return (
        <main className="details-page">
            <Link to="/search" className="back-button">Back to Search</Link>

            <section className="movie-details">
                <div className="details-poster">
                    <img src={movie.image} alt={movie.title} />
                </div>
                <div className="details-content">
                    <h1>{movie.title}</h1>
                    <div className="movie-info">
                        <p>
                            <strong>Director: </strong>
                            {directors.length > 0 ? directors.map(person => person.name).join(", ") : "Unknown"}
                        </p>

                        <p>
                            <strong>Release Date: </strong>{formatDate(movie.releaseDate)}
                        </p>
                        <p>
                            <strong>Age Rating: </strong>{certification || "NR"}
                        </p>
                        <p>
                            <strong>Runtime: </strong>{formatRuntime(movie.runtime)}
                        </p>
                        <p>
                            <strong>Vote Average: </strong>{movie.rating || "N/A"}
                        </p>
                        <p>
                            <strong>Favorite Count: </strong>
                            0
                        </p>
                    </div>

                    <div className="movie-overview">
                        <h2>Overview</h2>

                        <p>
                            {movie.summary}
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
