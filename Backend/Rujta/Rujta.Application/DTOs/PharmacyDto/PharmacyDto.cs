using Rujta.Application.DTOs.CustomerDtos;

namespace Rujta.Application.DTOs.PharmacyDtos
{
    public class PharmacyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? ContactNumber { get; set; }
        public string? OpenHours { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string? ImageUrl { get; set; }
        public int TotalOrders { get; set; }

        // ✅ Address as DTO
        public AddressDto? Address { get; set; }

        // ✅ Computed fields للـ frontend (backward compatibility)
        public string Location { get; set; } = string.Empty;
        public double Latitude => Address?.Latitude ?? 0;
        public double Longitude => Address?.Longitude ?? 0;

        public Guid? AdminId { get; set; }
        public string? AdminName { get; set; }
        public string? AdminEmail { get; set; }

        public Guid? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public string? ManagerEmail { get; set; }
        public string? ManagerPhone { get; set; }

        public int? ParentPharmacyId { get; set; }
        public string? ParentPharmacyName { get; set; }

        public bool IsMainPharmacy => ParentPharmacyId == null;
        public bool IsBranch => ParentPharmacyId != null;

        public int BranchesCount { get; set; }
    }
}