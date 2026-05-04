using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public ICollection<Medicine>? Medicines { get; set; }
        public ICollection<Discount>? Discounts { get; set; }
    }
}
