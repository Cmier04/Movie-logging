import "../css/MovieCard.css";
import "../css/index.css";
import { Link } from "react-router-dom";

function MovieCard({ movie, rank, favorite }) {
    return (
        <article className="movie-card">
            {rank && (<p className="movie-rank">#{rank}</p>)}

            <Link to={movie.url}>
                {movie.image ? (
                    <img src={movie.image}
                        alt={movie.alt}
                        className="movie-card-image"
                    />
                ) : (
                    <div className="movie-card-placeholder">
                        No Poster Available.
                    </div>
                )}
            </Link>

            <div className="movie-card-content">
                <h3>{movie.title}
                    {favorite && " ♥"}
                </h3>
                <p>{movie.rating}</p>
                <p>Release Date: {movie.releaseDate}</p>

                <Link to={movie.url} className="movie-card-details-btn">View Details</Link>
            </div>
        </article>
    );
}

export default MovieCard;