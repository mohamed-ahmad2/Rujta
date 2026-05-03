using Rujta.Application.DTOs.PharmacyDtos;
using Rujta.Application.Models;


namespace Rujta.Application.Mapper
{
    public class PharmacyProfile : Profile
    {
        public PharmacyProfile()
        {
            CreateMap<Pharmacy, PharmacyDto>()
                // Orders count
                .ForMember(dest => dest.TotalOrders,
                    opt => opt.MapFrom(src => src.Orders != null ? src.Orders.Count : 0))

                // Admin info
                .ForMember(dest => dest.AdminName,
                    opt => opt.MapFrom(src => src.Admin != null ? src.Admin.Name : null))
                .ForMember(dest => dest.AdminEmail,
                    opt => opt.MapFrom(src => src.Admin != null ? src.Admin.Email : null))

                // Manager info
                .ForMember(dest => dest.ManagerName,
                    opt => opt.MapFrom(src => src.Manager != null ? src.Manager.Name : null))
                .ForMember(dest => dest.ManagerEmail,
                    opt => opt.MapFrom(src => src.Manager != null ? src.Manager.Email : null))
                .ForMember(dest => dest.ManagerPhone,
                    opt => opt.MapFrom(src => src.Manager != null ? src.Manager.PhoneNumber : null))

                // Hierarchy info
                .ForMember(dest => dest.ParentPharmacyId,
                    opt => opt.MapFrom(src => src.ParentPharmacyID))
                .ForMember(dest => dest.ParentPharmacyName,
                    opt => opt.MapFrom(src => src.ParentPharmacy != null ? src.ParentPharmacy.Name : null))
                .ForMember(dest => dest.BranchesCount,
                    opt => opt.MapFrom(src => src.Branches != null ? src.Branches.Count : 0))

                .ReverseMap()
                .ForMember(dest => dest.Admin, opt => opt.Ignore())
                .ForMember(dest => dest.Manager, opt => opt.Ignore())
                .ForMember(dest => dest.Orders, opt => opt.Ignore())
                .ForMember(dest => dest.Employees, opt => opt.Ignore())
                .ForMember(dest => dest.InventoryItems, opt => opt.Ignore())
                .ForMember(dest => dest.Subscription, opt => opt.Ignore())
                .ForMember(dest => dest.Customers, opt => opt.Ignore())
                .ForMember(dest => dest.Discounts, opt => opt.Ignore())
                .ForMember(dest => dest.Branches, opt => opt.Ignore())
                .ForMember(dest => dest.ParentPharmacy, opt => opt.Ignore())
                .ForMember(dest => dest.ParentPharmacyID, opt => opt.MapFrom(src => src.ParentPharmacyId))
                .ForMember(dest => dest.SellDrugViaPharmacy, opt => opt.Ignore());


            CreateMap<Pharmacy, BranchDto>()
                .ForMember(dest => dest.ManagerName,
                    opt => opt.MapFrom(src => src.Manager != null ? src.Manager.Name : null))
                .ForMember(dest => dest.ManagerEmail,
                    opt => opt.MapFrom(src => src.Manager != null ? src.Manager.Email : null));


            CreateMap<Pharmacy, PharmacyTreeDto>()
                .ForMember(dest => dest.ManagerName,
                    opt => opt.MapFrom(src => src.Manager != null ? src.Manager.Name : null))
                .ForMember(dest => dest.Branches,
                    opt => opt.MapFrom(src => src.Branches));


            CreateMap<PharmacyRouteResult, NearestPharmacyDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Pharmacy.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Pharmacy.Name))
                .ForMember(dest => dest.DistanceMeters,
                    opt => opt.MapFrom(src => Math.Round(src.DistanceMeters, 2)))
                .ForMember(dest => dest.DurationMinutes,
                    opt => opt.MapFrom(src => Math.Round(src.DurationMinutes, 1)))
                .ForMember(dest => dest.Mode, opt => opt.MapFrom(src => src.Mode));
        }
    }
}