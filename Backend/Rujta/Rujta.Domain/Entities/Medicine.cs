using Rujta.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace Rujta.Domain.Entities
{
    public class Medicine : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Dosage { get; set; }

        public decimal Price { get; set; }

        public DateTime ExpiryDate { get; set; }

        public string? ActiveIngredient { get; set; }

        public ICollection<InventoryItem>? InventoryItems { get; set; }
        public ICollection<SellDrugViaPharmacy>? SellDrugViaPharmacies { get; set; }
        public ICollection<OrderItem>? OrderItems { get; set; }
    }
}
