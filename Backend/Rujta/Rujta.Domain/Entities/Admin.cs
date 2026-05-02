using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class Admin : Person
    {
        public ICollection<Pharmacy> Pharmacies { get; set; } = new List<Pharmacy>();

        public ICollection<Manager> Managers { get; set; } = new List<Manager>();
    }
}
