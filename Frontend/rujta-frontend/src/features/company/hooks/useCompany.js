// src/features/company/hook/useCompany.js
import { useState, useCallback } from "react";
import {
  getAllCompanies,
  getCompanyById,
  getPharmacyCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
} from "../api/company";

const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";

  if (err?.response?.data?.Message) return err.response.data.Message;
  if (err?.response?.data?.message) return err.response.data.message;

  if (err?.response?.data) {
    if (typeof err.response.data === "string") return err.response.data;
  }

  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 401) return "Unauthorized: Please log in again";
    if (status === 403) return "Forbidden: You don't have permission";
    if (status === 404) return "Company not found";
    if (status === 400) return "Invalid company data";
    if (status === 500) return "Server error: Please contact support";
    return `Request failed with status ${status}`;
  }

  if (err?.message) return err.message;

  return "Failed to load companies";
};

const mapCompany = (company = {}) => ({
  id: company.id ?? company.Id ?? "-",
  name: company.name ?? company.Name ?? "Unnamed Company",
  raw: company,
});

export default function useCompany() {
  const [companies, setCompanies] = useState([]);
  const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCompanies();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setCompanies(list.map(mapCompany));
      setError(null);
    } catch (err) {
      console.error("❌ fetchAll companies error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPharmacyCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPharmacyCompanies();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setPharmacyCompanies(list.map(mapCompany));
      setError(null);
    } catch (err) {
      console.error("❌ fetchPharmacyCompanies error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getCompanyById(id);
      return mapCompany(res?.data ?? res);
    } catch (err) {
      console.error("❌ fetchById company error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    setLoading(true);
    try {
      const res = await addCompany(data);
      await fetchAll();
      return mapCompany(res?.data ?? res);
    } catch (err) {
      console.error("❌ create company error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    setLoading(true);
    try {
      await updateCompany(id, data);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, name: data.name ?? data.Name ?? c.name, raw: data }
            : c,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("❌ update company error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setError(null);
    } catch (err) {
      console.error("❌ remove company error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    companies,
    pharmacyCompanies,
    loading,
    error,
    fetchAll,
    fetchPharmacyCompanies,
    fetchById,
    create,
    update,
    remove,
  };
}
