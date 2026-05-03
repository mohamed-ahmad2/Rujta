using Rujta.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;
namespace Rujta.Domain.Entities
{
    public class Pharmacy : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string OpenHours { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid? ManagerId { get; set; }

        [ForeignKey(nameof(ManagerId))]
        [InverseProperty(nameof(Entities.Manager.ManagedPharmacy))]
        public Manager? Manager { get; set; }

        public Guid? AdminId { get; set; }

        [ForeignKey(nameof(AdminId))]
        public Admin? Admin { get; set; }


        public int? ParentPharmacyID { get; set; }

        [ForeignKey(nameof(ParentPharmacyID))]
        public virtual Pharmacy? ParentPharmacy { get; set; }

        public ICollection<Pharmacy> Branches { get; set; } = new List<Pharmacy>();


        [InverseProperty(nameof(Employee.Pharmacy))]
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();


        public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
        public ICollection<SellDrugViaPharmacy> SellDrugViaPharmacy { get; set; } = new List<SellDrugViaPharmacy>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();


        public ICollection<Customer> Customers { get; set; } = new List<Customer>();

        public Subscription? Subscription { get; set; }

        public ICollection<Discount>? Discounts { get; set; }
    }
}