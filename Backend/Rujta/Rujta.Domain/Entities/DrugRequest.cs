using Rujta.Domain.Enums;

namespace Rujta.Domain.Entities
{
    public class DrugRequest
    {
        public int Id { get; set; }

        public int PharmacyId { get; set; }
        public string SubmittedByUserId { get; set; } = string.Empty;
        public string DrugName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public string Supplier { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public DateTime ExpiryDate { get; set; }

        public DrugRequestStatus Status { get; set; } = DrugRequestStatus.Pending;
        public string? ReviewedByAdminId { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
    }
}
