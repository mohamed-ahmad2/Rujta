namespace Rujta.Application.DTOs.MedicineDtos
{
    public class ExpiredItemDto
    {
        public int InventoryItemId { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public int Quantity { get; set; }
        public int DaysUntilExpiry { get; set; }

    }
}

