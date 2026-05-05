import React, { useEffect, useState } from "react";
import { getPharmacyReport } from "../../../../services/ReportService";
import { TrendingUp, ShoppingCart, DollarSign, Pill } from "lucide-react";

const cards = (report) => [
  {
    title: "Total Sales",
    value: report.totalSales,
    icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Total Orders",
    value: report.totalOrders,
    icon: <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Total Profit",
    value: report.totalProfit,
    icon: <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Top Selling Medicine",
    value: report.topMedicine,
    icon: <Pill className="h-4 w-4 sm:h-5 sm:w-5" />,
    color: "bg-purple-100 text-purple-600",
  },
];

export default function PharmacyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPharmacyReport()
      .then((res) => {
        setReport(res);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load pharmacy report");
        setLoading(false);
      });
  }, []);

  // Loading
  if (loading)
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent sm:h-10 sm:w-10" />
          <p className="text-sm text-gray-500 sm:text-base">
            Loading report...
          </p>
        </div>
      </div>
    );

  // Error
  if (error)
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:px-6 sm:py-4 sm:text-base">
          {error}
        </div>
      </div>
    );

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 sm:text-lg md:text-xl lg:text-2xl">
          Pharmacy Report
        </h2>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Overview of your pharmacy performance
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 xl:grid-cols-4">
        {cards(report).map((card, index) => (
          <div
            key={index}
            className="flex w-full items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md sm:gap-4 sm:p-4 md:p-5"
          >
            {/* Icon */}
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 md:h-12 md:w-12 ${card.color}`}
            >
              {card.icon}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-gray-500 sm:text-sm">
                {card.title}
              </p>
              <p className="mt-0.5 truncate text-base font-bold text-gray-800 sm:text-lg md:text-xl lg:text-2xl">
                {card.value ?? "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
