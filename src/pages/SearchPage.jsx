import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
    getNowPlayingMovies,
    getTopMoviesByGenre,
    movieGenres,
    searchTmdb 
    } from "../api";
import MovieCard from "../components/MovieCard";
import useFavorites from "../hooks/useFavorites";

function MovieRow({ title, movies, isFavorite }) {
    if (!movies || movies.length === 0) {
        return null;
    }
    return (
        <section className="movie-section">
            <h2>{title}</h2>

            <div className="movie-row">
                {movies.map((movie) => (
                    <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        favorite={isFavorite(movie.id)}
                    />
                ))}
            </div>
        </section>
    );
}

export default function SearchPage() {
    const [searchResults, setSearchResults] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [genreMovies, setGenreMovies] = useState({});
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const {isFavorite} = useFavorites();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";

    useEffect(() => {
        if(!query) {
            setSearchResults([]);
            return;
        }

        async function loadSearchResults() {
            try {
                const results = await searchTmdb(query);
                setSearchResults(results);
            } catch (error) {
                console.error("Error searching movies:", error);
            }
        }

        loadSearchResults();
    }, [query]);

    useEffect(() => {
        async function loadNowPlaying() {
            try {
                const results = await getNowPlayingMovies();

                setNowPlaying(results.slice(0, 10));
            } catch (error) {
                console.error("Error loading now playing:", error);
            }
        }

        loadNowPlaying();
    }, []);

    useEffect(() => {
        async function loadGenreMovies() {
            try {
                const featureGenres = movieGenres.slice(0, 6);
                const results = {};
                await Promise.all(
                    featureGenres.map(async (genre) => {
                        const movies = await getTopMoviesByGenre(genre.id);

                        results[genre.name] = movies.slice(0, 10);
                    })
                );
                setGenreMovies(results);
            } catch (error) {
                console.error("Error loading genre movies:", error);
            }
        }
        loadGenreMovies();
    }, []);

    return (
        <main className="search-page">
            <h1>{query?`Search results for "${query}"` : "Discover New Movies"}</h1>

            {query && (
                <section className="movie-section">
                    <h2>Search Results</h2>
                    {searchResults.length > 0 ? (
                        <div className="movie-grid">
                            {searchResults.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </div>
                    ) : (
                        <p>No movies found.</p>
                    )}
                </section>
            )}
            <MovieRow title="Now Playing" movies={nowPlaying} isFavorite={isFavorite}/>

            {movieGenres.map((genre) => (
                <MovieRow key={genre.id} title={`Top ${genre.name} Movies`} movies={genreMovies[genre.name]} isFavorite={isFavorite}/>
            ))}
        </main>
    );
}