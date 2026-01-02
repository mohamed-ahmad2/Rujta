using Rujta.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class Pharmacy : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string OpenHours { get; set; } = string.Empty ;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool IsActive { get; set; }


        [ForeignKey("Admin")]
        public Guid? AdminId { get; set; }
        public Admin? Admin { get; set; }

        public int? ParentPharmacyID { get; set; }
        public virtual Pharmacy? ParentPharmacy { get; set; }
        public ICollection<Pharmacy> Branches { get; set; } = new List<Pharmacy>();


        public ICollection<Pharmacist> Pharmacists { get; set; } = new List<Pharmacist>();
        public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
        public ICollection<SellDrugViaPharmacy> SellDrugViaPharmacies { get; set; } = new List<SellDrugViaPharmacy>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
