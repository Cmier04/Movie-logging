import "../css/MovieCard.css";
import "../css/index.css";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
    return (
        <article className="movie-card">
            <a href={movie.url}>
                {movie.image ? (
                    <img src={movie.image}
                        alt={movie.title}
                        className="movie-card-image"
                    />
                ) : (
                    <div className="movie-card-placeholder">
                        No Poster Available.
                    </div>
                )}
            </a>

            <div className="movie-card-content">
                <h3>{movie.title}</h3>
                <p>{movie.rating}</p>
                <p>Release: {movie.releaseDate}</p>

                <Link to={movie.url} className="movie-card-details-btn">View Details</Link>
            </div>
        </article>
    );
}

export default MovieCard;