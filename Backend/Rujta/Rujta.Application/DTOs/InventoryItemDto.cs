using Rujta.Domain.Enums;

namespace Rujta.Application.DTOs
{
    public class InventoryItemDto
    {
        public int Id { get; set; }
        public int PharmacyID { get; set; }      
        public int MedicineID { get; set; }
        public int? PrescriptionID { get; set; }
        public int? CategoryId { get; set; }
        public string? MedicineName { get; set; }
        public string? CategoryName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public ProductStatus Status { get; set; } = ProductStatus.InStock;
        public DateTime ExpiryDate { get; set; }
    }
}
