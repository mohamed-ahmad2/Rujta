using Rujta.Application.DTOs.PharmacyDtos;
using Rujta.Application.Models;

namespace Rujta.Application.Mapper
{
    public class PharmacyProfile : Profile
    {
        public PharmacyProfile()
        {
            CreateMap<Pharmacy, PharmacyDto>()
                .ForMember(dest => dest.TotalOrders,
                    opt => opt.MapFrom(src =>
                        src.Orders != null ? src.Orders.Count : 0))
                .ReverseMap()
                .ForMember(dest => dest.Admin, opt => opt.Ignore())
                .ForMember(dest => dest.Orders, opt => opt.Ignore())
                .ForMember(dest => dest.Employees, opt => opt.Ignore())
                .ForMember(dest => dest.InventoryItems, opt => opt.Ignore())
                .ForMember(dest => dest.Subscription, opt => opt.Ignore())
                .ForMember(dest => dest.Customers, opt => opt.Ignore())
                .ForMember(dest => dest.Discounts, opt => opt.Ignore())
                .ForMember(dest => dest.Branches, opt => opt.Ignore())
                .ForMember(dest => dest.ParentPharmacy, opt => opt.Ignore())
                .ForMember(dest => dest.SellDrugViaPharmacy, opt => opt.Ignore());

            CreateMap<PharmacyRouteResult, NearestPharmacyDto>()
                .ForMember(dest => dest.Id,
                    opt => opt.MapFrom(src => src.Pharmacy.Id))

                .ForMember(dest => dest.Name,
                    opt => opt.MapFrom(src => src.Pharmacy.Name))

                .ForMember(dest => dest.DistanceMeters,
                    opt => opt.MapFrom(src => Math.Round(src.DistanceMeters, 2)))

                .ForMember(dest => dest.DurationMinutes,
                    opt => opt.MapFrom(src => Math.Round(src.DurationMinutes, 1)))

                .ForMember(dest => dest.Mode,
                    opt => opt.MapFrom(src => src.Mode));
        }
    }
}