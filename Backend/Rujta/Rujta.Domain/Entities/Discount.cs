using System.ComponentModel.DataAnnotations.Schema;
using Rujta.Domain.Common;
using Rujta.Domain.Enums;

namespace Rujta.Domain.Entities
{
    public class Discount : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public DiscountType Type { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DiscountScope Scope { get; set; }
        public int? MedicineId { get; set; }
        public int? CategoryId { get; set; }
        public int? CompanyId { get; set; }

        public Medicine? Medicine { get; set; }
        public Category? Category { get; set; }
        public Company? Company { get; set; }

        public int PharmacyId { get; set; }
        public Pharmacy Pharmacy { get; set; } = null!;


        [NotMapped]
        public bool IsCurrentlyActive
            => IsActive
            && StartDate <= DateTime.UtcNow
            && EndDate >= DateTime.UtcNow;

       
        [NotMapped]
        public bool IsExpired => EndDate < DateTime.UtcNow;

       
        [NotMapped]
        public bool IsScheduled => StartDate > DateTime.UtcNow;


        [NotMapped]
        public string Status => GetStatus();

        private string GetStatus()
        {
            if (!IsActive)
                return "Inactive";

            if (IsExpired)
                return "Expired";

            if (IsScheduled)
                return "Scheduled";

            return "Active";
        }
    }
}