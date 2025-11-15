using System;

namespace Rujta.Application.DTOs
{
    public class InventoryItemDto
    {
        public int Id { get; set; }
        public int PharmacyID { get; set; }      
        public int MedicineID { get; set; }
        public int? PrescriptionID { get; set; }
        public int Quantity { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal Price { get; set; }
        public bool IsDispensed { get; set; }

        
        public string? MedicineName { get; set; }
    }
}
