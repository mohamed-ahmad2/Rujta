namespace Rujta.Application.DTOs.InventoryDto
{
    public class LowStockItemDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public string? UnitName { get; set; }  

        public int ReorderLevel { get; set; } 
    }
}

