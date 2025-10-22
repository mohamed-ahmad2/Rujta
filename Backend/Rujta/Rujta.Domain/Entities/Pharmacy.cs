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

        [ForeignKey("Manager")]
        public Guid? ManagerId { get; set; }

        [ForeignKey("ParentPharmacy")]
        public int? ParentPharmacyID { get; set; }


        public virtual Admin? Admin { get; set; }
        public virtual Manager? Manager { get; set; }
        public virtual Pharmacy? ParentPharmacy { get; set; }
        
        public ICollection<Staff>? Staff { get; set; }
        public ICollection<InventoryItem>? InventoryItems { get; set; }
        public ICollection<SellDrugViaPharmacy>? SellDrugViaPharmacies { get; set; }
        public ICollection<Order>? Orders { get; set; }
    }
}
