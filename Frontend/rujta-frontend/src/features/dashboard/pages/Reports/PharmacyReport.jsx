import React, { useEffect, useState } from "react";
import { getPharmacyReport } from "../../../../services/ReportService";

export default function PharmacyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  getPharmacyReport()
    .then((res) => {
      setReport(res); // بدل res.data
      setLoading(false);
    })
    .catch(() => {
      setError("Failed to load pharmacy report");
      setLoading(false);
    });
}, []);


  if (loading) return <h3>Loading...</h3>;
  if (error) return <h3>{error}</h3>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pharmacy Report</h2>

      <div style={cardStyle}>
        <h4>Total Sales</h4>
        <p>{report.totalSales}</p>
      </div>

      <div style={cardStyle}>
        <h4>Total Orders</h4>
        <p>{report.totalOrders}</p>
      </div>

      <div style={cardStyle}>
        <h4>Total Profit</h4>
        <p>{report.totalProfit}</p>
      </div>

      <div style={cardStyle}>
        <h4>Top Selling Medicine</h4>
        <p>{report.topMedicine}</p>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};
