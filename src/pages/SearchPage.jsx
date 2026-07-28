import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchTmdb } from "../api";

export default function SearchPage() {
    const [searchResults, setSearchResults] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [genreMovies, setGenreMovies] = useState([]);
    const [recommendedMovies, setRecommendedMovies] = useState([]);

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

    return (
        <main>
            <h1> {query
                ? `Search results for "${query}"`
                : "Discover New Movies"
                }
            </h1>
        </main>
    );
}