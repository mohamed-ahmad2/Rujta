using System.ComponentModel.DataAnnotations;

namespace Rujta.Application.DTOs
{
    public class CreateDiscountDto : BaseEntityDto
    {
        [Required(ErrorMessage = "Discount name is required")]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Discount value must be greater than 0")]
        public decimal Value { get; set; }

        public DiscountType Type { get; set; }
        public DiscountScope Scope { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? MedicineId { get; set; }
        public int? CategoryId { get; set; }
        public int? CompanyId { get; set; }
    }
}