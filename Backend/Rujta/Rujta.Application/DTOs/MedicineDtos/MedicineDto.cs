namespace Rujta.Application.DTOs.MedicineDtos
{
    public class MedicineDto : BaseEntityDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Dosage { get; set; }
        public decimal Price { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string? CompanyName { get; set; }
        public int? CategoryId { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? ImageUrl { get; set; }


        public decimal DiscountedPrice { get; set; }
        public decimal DiscountValue { get; set; }
        public bool HasDiscount { get; set; }

        public string? DiscountName { get; set; }
        public DiscountType? DiscountType { get; set; }
    }
}