using Rujta.Application.DTOs.MedicineDtos;


namespace Rujta.Application.Mapper
{
    public class MedicineProfile : Profile
    {
        public MedicineProfile()
        {
            CreateMap<Medicine, MedicineDto>()
                .ForMember(dest => dest.CompanyName,
                    opt => opt.MapFrom(src =>
                        src.Company != null ? src.Company.Name : null))
                .ReverseMap()
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.InventoryItems, opt => opt.Ignore())
                .ForMember(dest => dest.OrderItems, opt => opt.Ignore())
                .ForMember(dest => dest.Discounts, opt => opt.Ignore());
        }
    }
}