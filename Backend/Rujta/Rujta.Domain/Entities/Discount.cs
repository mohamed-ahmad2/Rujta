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
    }
}
