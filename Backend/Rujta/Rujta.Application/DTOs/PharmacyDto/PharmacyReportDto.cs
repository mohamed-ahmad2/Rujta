using Rujta.Application.DTOs.InventoryDto;
using Rujta.Application.DTOs.MedicineDtos;
using System.Collections.Generic;

namespace Rujta.Application.DTOs.PharmacyDto
{
    public class PharmacyReportDto
    {
        public int PharmacyId { get; set; }
        public string PharmacyName { get; set; } = string.Empty;

        public decimal TotalSales { get; set; }              
        public decimal TotalRevenue { get; set; }              
        public int TotalOrders { get; set; }

        public SalesSummaryDto SalesSummary { get; set; } = new();
        public InventorySummaryDto InventorySummary { get; set; } = new();

        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<LowStockItemDto> LowStockItems { get; set; } = new();
        public List<ExpiredItemDto> ExpiredItems { get; set; } = new();

    
        public List<DailySalesDto> DailySales { get; set; } = new();

     
        public List<string> Alerts { get; set; } = new();
    }
}

