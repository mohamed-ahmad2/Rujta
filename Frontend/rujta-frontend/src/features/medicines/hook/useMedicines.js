import { useState, useCallback } from "react";
import {
  getAllMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  filterMedicines,
} from "../api/medicinesApi";

export default function useMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllMedicines();
      setMedicines(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    try {
      setLoading(true);
      const res = await getMedicineById(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to fetch medicine");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    try {
      setLoading(true);
      const res = await addMedicine(data);
      await fetchAll();
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    try {
      setLoading(true);
      await updateMedicine(id, data);
      await fetchAll();
    } catch (err) {
      setError(err.message || "Failed to update medicine");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setLoading(true);
      await deleteMedicine(id);
      await fetchAll();
    } catch (err) {
      setError(err.message || "Failed to delete medicine");
    } finally {
      setLoading(false);
    }
  };

  const search = async (query) => {
    try {
      setLoading(true);
      const res = await searchMedicines(query);
      setMedicines(res.data);
    } catch (err) {
      setError(err.message || "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  const filter = async (filterData) => {
    try {
      setLoading(true);
      const res = await filterMedicines(filterData);
      setMedicines(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to filter medicines");
    } finally {
      setLoading(false);
    }
  };

  return {
    medicines,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    search,
    filter,
  };
}
