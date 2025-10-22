using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class Admin : Person
    {
        public ICollection<Pharmacy>? Pharmacies { get; set; }
        public ICollection<Manager>? Managers { get; set; }
    }
}
