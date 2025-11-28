import { useState, useEffect } from "react";
import { searchMedicines } from "../api/medicinesSearchApi";

export const useSearchMedicines = (query, top = 10) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await searchMedicines(query, top);
                setResults(response.data);
            } catch (err) {
                setError(err.message || "Failed to fetch medicines");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, top]);

    return { results, loading, error };
};