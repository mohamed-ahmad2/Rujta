using Rujta.Application.DTOs.DiscountDtos;

namespace Rujta.Application.Mapper
{
    public class DiscountProfile : Profile
    {
        public DiscountProfile()
        {
            CreateMap<CreateDiscountDto, Discount>()
                .ForMember(dest => dest.IsActive,
                    opt => opt.MapFrom(_ => true))

                .ForMember(dest => dest.MedicineId,
                    opt => opt.MapFrom(src =>
                        src.Scope == DiscountScope.Medicine ? src.MedicineId : null))

                .ForMember(dest => dest.CategoryId,
                    opt => opt.MapFrom(src =>
                        src.Scope == DiscountScope.Category ? src.CategoryId : null))

                .ForMember(dest => dest.CompanyId,
                    opt => opt.MapFrom(src =>
                        src.Scope == DiscountScope.Company ? src.CompanyId : null))

                .ForMember(dest => dest.PharmacyId,
                    opt => opt.Ignore());

            CreateMap<Discount, DiscountDto>()
                .ForMember(dest => dest.IsCurrentlyActive,
                    opt => opt.MapFrom(src => src.IsCurrentlyActive))
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status));
        }
    }
}