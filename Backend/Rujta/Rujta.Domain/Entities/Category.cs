using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public ICollection<Medicine>? Medicines { get; set; }
    }
}
