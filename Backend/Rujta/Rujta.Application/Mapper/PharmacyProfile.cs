using Rujta.Application.DTOs.PharmacyDtos;
using Rujta.Application.Models;

namespace Rujta.Application.Mapper
{
    public class PharmacyProfile : Profile
    {
        public PharmacyProfile()
        {
            ConfigurePharmacyToDtoMap();
            ConfigurePharmacyToBranchMap();
            ConfigurePharmacyToTreeMap();
            ConfigureRouteResultMap();
        }

        private void ConfigurePharmacyToDtoMap()
        {
            CreateMap<Pharmacy, PharmacyDto>()
                .ForMember(d => d.TotalOrders, o => o.MapFrom(s => s.Orders.Count))
                .ForMember(d => d.AdminName, o => o.MapFrom(s => s.Admin!.Name))
                .ForMember(d => d.AdminEmail, o => o.MapFrom(s => s.Admin!.Email))
                .ForMember(d => d.ManagerName, o => o.MapFrom(s => s.Manager!.Name))
                .ForMember(d => d.ManagerEmail, o => o.MapFrom(s => s.Manager!.Email))
                .ForMember(d => d.ManagerPhone, o => o.MapFrom(s => s.Manager!.PhoneNumber))
                .ForMember(d => d.ParentPharmacyId, o => o.MapFrom(s => s.ParentPharmacyID))
                .ForMember(d => d.ParentPharmacyName, o => o.MapFrom(s => s.ParentPharmacy!.Name))
                .ForMember(d => d.BranchesCount, o => o.MapFrom(s => s.Branches.Count))
                .ReverseMap()
                .ForMember(d => d.ParentPharmacyID, o => o.MapFrom(s => s.ParentPharmacyId))
                .IgnoreNavigationProperties();
        }

        private void ConfigurePharmacyToBranchMap()
        {
            CreateMap<Pharmacy, BranchDto>()
                .ForMember(d => d.ManagerName, o => o.MapFrom(s => s.Manager!.Name))
                .ForMember(d => d.ManagerEmail, o => o.MapFrom(s => s.Manager!.Email));
        }

        private void ConfigurePharmacyToTreeMap()
        {
            CreateMap<Pharmacy, PharmacyTreeDto>()
                .ForMember(d => d.ManagerName, o => o.MapFrom(s => s.Manager!.Name))
                .ForMember(d => d.Branches, o => o.MapFrom(s => s.Branches));
        }

        private void ConfigureRouteResultMap()
        {
            CreateMap<PharmacyRouteResult, NearestPharmacyDto>()
                .ForMember(d => d.Id, o => o.MapFrom(s => s.Pharmacy.Id))
                .ForMember(d => d.Name, o => o.MapFrom(s => s.Pharmacy.Name))
                .ForMember(d => d.DistanceMeters, o => o.MapFrom(s => Math.Round(s.DistanceMeters, 2)))
                .ForMember(d => d.DurationMinutes, o => o.MapFrom(s => Math.Round(s.DurationMinutes, 1)))
                .ForMember(d => d.Mode, o => o.MapFrom(s => s.Mode));
        }
    }
}