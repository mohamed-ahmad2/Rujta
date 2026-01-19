using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class Customer : Person
    {
        public int PharmacyId { get; set; }
        public Pharmacy Pharmacy { get; set; } = null!;
    }
}
