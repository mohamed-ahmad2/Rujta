using Rujta.Application.DTOs.PharmacyDtos;

namespace Rujta.Application.Mapper
{
    public class PharmacyProfile : Profile
    {
        public PharmacyProfile()
        {
            CreateMap<Pharmacy, PharmacyDto>()
                .ForMember(d => d.Address, opt => opt.MapFrom(s => s.Address))
                .ForMember(d => d.Location, opt => opt.MapFrom(s => BuildLocation(s.Address)))
                .ForMember(d => d.ManagerName, opt => opt.MapFrom(s => GetManagerName(s)))
                .ForMember(d => d.ManagerEmail, opt => opt.MapFrom(s => GetManagerEmail(s)))
                .ForMember(d => d.ManagerPhone, opt => opt.MapFrom(s => GetManagerPhone(s)))
                .ForMember(d => d.AdminName, opt => opt.MapFrom(s => GetAdminName(s)))
                .ForMember(d => d.AdminEmail, opt => opt.MapFrom(s => GetAdminEmail(s)))
                .ForMember(d => d.ParentPharmacyId, opt => opt.MapFrom(s => s.ParentPharmacyID))
                .ForMember(d => d.ParentPharmacyName, opt => opt.MapFrom(s => GetParentPharmacyName(s)))
                .ForMember(d => d.BranchesCount, opt => opt.MapFrom(s => GetBranchesCount(s)))
                .ForMember(d => d.ImageUrl, opt => opt.MapFrom(s => s.ImageUrl))
                .ForMember(d => d.TotalOrders, opt => opt.Ignore());
        }


        private static string BuildLocation(Address? address)
        {
            if (address == null) return string.Empty;

            var parts = new List<string>();

            AppendIfNotEmpty(parts, address.Street);
            AppendBuildingNoIfNotEmpty(parts, address.BuildingNo);
            AppendIfNotEmpty(parts, address.City);
            AppendIfNotEmpty(parts, address.Governorate);

            return string.Join(", ", parts);
        }

        private static void AppendIfNotEmpty(List<string> parts, string? value)
        {
            if (!string.IsNullOrWhiteSpace(value))
                parts.Add(value);
        }

        private static void AppendBuildingNoIfNotEmpty(List<string> parts, string? buildingNo)
        {
            if (!string.IsNullOrWhiteSpace(buildingNo))
                parts.Add($"Building {buildingNo}");
        }

        private static string? GetManagerName(Pharmacy p) => p.Manager?.Name;
        private static string? GetManagerEmail(Pharmacy p) => p.Manager?.Email;
        private static string? GetManagerPhone(Pharmacy p) => p.Manager?.PhoneNumber;

        private static string? GetAdminName(Pharmacy p) => p.Admin?.Name;
        private static string? GetAdminEmail(Pharmacy p) => p.Admin?.Email;

 
        private static string? GetParentPharmacyName(Pharmacy p) => p.ParentPharmacy?.Name;
        private static int GetBranchesCount(Pharmacy p) => p.Branches?.Count ?? 0;
    }
}