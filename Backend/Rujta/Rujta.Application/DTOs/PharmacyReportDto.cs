using System.Collections.Generic;

namespace Rujta.Application.DTOs
{
    public class PharmacyReportDto
    {
        public int PharmacyId { get; set; }
        public string PharmacyName { get; set; } = string.Empty;

        public decimal TotalSales { get; set; }                 // إجمالي المبيعات في الفترة
        public decimal TotalRevenue { get; set; }               // لو عندك فرق بين sales & revenue
        public int TotalOrders { get; set; }

        public SalesSummaryDto SalesSummary { get; set; } = new();
        public InventorySummaryDto InventorySummary { get; set; } = new();

        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<LowStockItemDto> LowStockItems { get; set; } = new();
        public List<ExpiredItemDto> ExpiredItems { get; set; } = new();

        // بيانات للسلايد/الفترة الزمنية (chart)
        public List<DailySalesDto> DailySales { get; set; } = new();

        // اختياري: تنبيهات عامة
        public List<string> Alerts { get; set; } = new();
    }
}

