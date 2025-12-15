namespace Rujta.Application.DTOs
{
    public class MedicineFilterDto
    {
        public List<int>? CategoryIds { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? CompanyName { get; set; }
    }

}
