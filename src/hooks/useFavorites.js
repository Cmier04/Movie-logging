import { useEffect, useState } from "react";
import { useAuth0} from "@auth0/auth0-react";

export default function useFavorites() {
    const { user, isAuthenticated } = useAuth0();
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setFavorites([]);
            return;
        }

        const key = `favorites-${user.sub}`;
        const saved = localStorage.getItem(key);

        setFavorites(saved ? JSON.parse(saved) : []);
    }, [user, isAuthenticated]);

    function toggleFavorites(movieId) {
        if (!user) return;

        const key = `favorites-${user.sub}`;
        let updated;
        if (favorites.includes(movieId)) {
            updated = favorited.filter(id => id !== movieId);
        } else {
            updated = [...favorites, movieId];
        }

        setFavorites(updated);
        localStorage.setItem(key, JSON.stringify(updated));
    }

    function isFavorite(movieId) {
        return favorites.includes(movieId);
    }

    return {
        favorites,
        toggleFavorites,
        isFavorite
    };
}