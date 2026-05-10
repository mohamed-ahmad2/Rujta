using Rujta.Application.DTOs.InventoryDto;

namespace Rujta.Application.Mapper
{
    public class InventoryItemProfile : Profile
    {
        public InventoryItemProfile()
        {
            CreateMap<InventoryItem, InventoryItemDto>()
                .ForMember(dest => dest.MedicineName,
                    opt => opt.MapFrom(src => GetMedicineName(src)))

                .ForMember(dest => dest.CategoryId,
                    opt => opt.MapFrom(src => GetCategoryId(src)))

                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => GetCategoryName(src)))

                .ForMember(dest => dest.CompanyId,
                    opt => opt.MapFrom(src => GetCompanyId(src)))

                .ForMember(dest => dest.CompanyName,
                    opt => opt.MapFrom(src => GetCompanyName(src)))

                .ReverseMap()
                .ForMember(dest => dest.Medicine, opt => opt.Ignore())
                .ForMember(dest => dest.Pharmacy, opt => opt.Ignore())
                .ForMember(dest => dest.Prescription, opt => opt.Ignore());
        }

        private static string? GetMedicineName(InventoryItem src)
            => src.Medicine?.Name;

        private static int? GetCategoryId(InventoryItem src)
            => src.Medicine?.CategoryId;

        private static string? GetCategoryName(InventoryItem src)
            => src.Medicine?.Category?.Name;

        private static int? GetCompanyId(InventoryItem src)
            => src.Medicine?.CompanyId;

        private static string? GetCompanyName(InventoryItem src)
            => src.Medicine?.Company?.Name;
    }
}