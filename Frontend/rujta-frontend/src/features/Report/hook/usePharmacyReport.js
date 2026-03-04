// src/features/report/hooks/usePharmacyReport.js
import { useEffect, useState } from "react";
import { getPharmacyReport } from "../api/ReportApi";

export const usePharmacyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getPharmacyReport();
      setReport(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return {
    report,
    loading,
    error,
    refetch: fetchReport,
  };
};
