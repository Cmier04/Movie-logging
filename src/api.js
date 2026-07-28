import { useParams } from "react-router-dom";

const tmdbBaseUrl = "https://api.themoviedb.org/3";
const tmdbSearchUrl = `${tmdbBaseUrl}/search/movie`;
const tmdbMovieUrl = `${tmdbBaseUrl}/movie`;
const tmdbTrendingUrl = `${tmdbBaseUrl}/trending/movie/week`;
const tmdbGenreUrl = `${tmdbBaseUrl}/genre/movie/list`;
const tmdbDiscoverUrl = `${tmdbBaseUrl}/discover/movie"`;
const tmdbPosterBaseUrl = "https://image.tmdb.org/t/p/w342";
const tmdbTopRatedUrl = `${tmdbBaseUrl}/movie/top_rated`;
const tmdbPopularUrl = `${tmdbBaseUrl}/movie/popular`;

export function getTmdbApiKey() {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    console.log("TMDB API key:", apiKey);
    console.log("TMDB API key length:", apiKey?.length);
    
    if (!apiKey || apiKey === "YOUR_TMDB_API_KEY") {
        return "";
    }

    return apiKey;
}

function cleanSummary(summary) {
    if (!summary) {
        return "No summary is available.";
    }

    return summary.replace(/<[^>]*>/g, "");
}

function normalizeTmdbResults(results) {
    return results.map((movie) => {
        return {
            id: movie.id,
            source: "TMDB",
            sourceClass: "text-bg-primary",
            title: movie.title,
            image: movie.poster_path ? `${tmdbPosterBaseUrl}${movie.poster_path}` : "",
            alt: `${movie.title} poster`,
            summary: movie.overview || "No summary is available.",
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
            url: `/details?source=tmdb&id=${movie.id}`
        };
    });
}

export async function fetchTmdbJson(url) {
    const apiKey = getTmdbApiKey();

    if (!apiKey) {
        throw new Error("Missing TMDB API key.");
    }

    const separator = url.includes("?") ? "&" : "?";
    const response = await fetch(`${url}${separator}api_key=${apiKey}`);
    const data = await response.json();

    console.log("TMDB status:", response.status);
    console.log("TMDB response:", data);

    if (!response.ok) {
        throw new Error(`TMDB dashboard request failed (${response.status}): ${data.status_message || "Unknown error"}.`);
    }

    return data;
}

export async function getRandomMovies() {
    const randomPage = Math.floor(Math.random() * 10) + 1;

    const url = `${tmdbPopularUrl}?language=enUS&page=${randomPage}`;
    const data = await fetchTmdbJson(url);

    const shuffled = [...data.results].sort(
        () => Math.random() - 0.5
    );

    return shuffled.slice(0, 5);
}

export async function getTopMovies() {
    const url = `${tmdbTopRatedUrl}?language=en-US&page=1`;
    const data = await fetchTmdbJson(url);

    return data.results.slice(0, 10);
}

export async function searchTmdb(query) {
    const movieQuery = encodeURIComponent(query);
    const data = await fetchTmdbJson(`${tmdbSearchUrl}?language=en-US&query=${movieQuery}&include_adult=false`);

    return normalizeTmdbResults(data.results || []);
}

export async function searchMedia(query, selectedSource) {
    const searchTasks = [];

    if (selectedSource === "all" || selectedSource === "tmdb") {
        searchTasks.push(searchTmdb(query));
    }

    if (selectedSource === "all" || selectedSource === "tvmaze") {
        searchTasks.push(searchTvMaze(query));
    }

    const responses = await Promise.allSettled(searchTasks);
    const tmdbResponse = selectedSource === "tvmaze" ? null : responses.shift();
    const tmdbResults = tmdbResponse?.status === "fulfilled" && tmdbResponse.value ? tmdbResponse.value.slice(0, 6) : [];
    const skippedTmdb = selectedSource !== "tvmaze" && (!tmdbResponse || tmdbResponse.status === "rejected" || !tmdbResponse.value);

    return {
        results: [...tmdbResults].slice(0, 12),
        skippedTmdb
    };
}

export async function fetchTmdbMovieDetails(movieId) {
    const data = await fetchTmdbJson(`${tmdbBaseUrl}/movie/${movieId}?language=en-US`);

    return data;
}

export async function getMovieRecommendations(movieId) {
    const data = await fetchTmdbJson(`${tmdbBaseUrl}/movie/${movieId}/recommendations?language=en-US&page=1`);

    return data.results;

}

export async function fetchTmdbMovieGenres() {
    const data = await fetchTmdbJson(`${tmdbGenreUrl}`);
    return data.genres || [];
}

export async function getTopRatedGenreData() {
    const [movieData, genreData] = await Promise.all ([fetchTmdbJson(`${tmdbTopRatedUrl}?language=en-US&page=1`), fetchTmdbMovieGenres() ]);

    const genreMap = {};

    genreData.forEach((genre) => {
        genreMap[genre.id] = genre.name;
    });

    const genreCounts = {};

    movieData.results?.forEach((movie) => {
        movie.genre_ids?.forEach((genreId) => {
            const genreName = genreMap[genreId];

            if (genreName) {
                genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
            }
        });
    });

    return Object.entries(genreCounts).map(([name, value]) => ({
        name, value
    })).sort((a, b) => b.value - a.value).slice(0, 10);
}
