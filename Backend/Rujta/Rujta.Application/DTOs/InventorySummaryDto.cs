namespace Rujta.Application.DTOs
{
    public class InventorySummaryDto
    {
        public int TotalItems { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public decimal InventoryTotalValue { get; set; }
    }
}

