namespace Rujta.Application.DTOs
{
    public class CreateDiscountDto : BaseEntityDto
    {
        public string Name { get; set; } = string.Empty;
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
