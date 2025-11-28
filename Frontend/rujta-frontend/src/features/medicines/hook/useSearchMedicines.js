import { useState, useEffect } from "react";
import { searchMedicines } from "../api/medicinesSearchApi";

export const useSearchMedicines = (query, top = 10) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(false);

    useEffect(() => {
        if (!query || selected) {
            if (!selected) setResults([]);
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
    }, [query, top, selected]);

    const chooseResult = (medicine) => {
        setResults([]);
        setSelected(true);
        return medicine;
    };

    const resetSelected = () => setSelected(false);

    return { results, loading, error, setResults, selected, chooseResult, resetSelected };
};
