using System.ComponentModel.DataAnnotations;

namespace Rujta.Models
{
    public class Medicine
    {
        [Key]
        public int MedicineID { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Dosage { get; set; }

        public decimal Price { get; set; }

        public DateTime ExpiryDate { get; set; }

        [MaxLength(100)]
        public string? ActiveIngredient { get; set; }

        
        public ICollection<InventoryItem>? InventoryItems { get; set; }
    }
}
