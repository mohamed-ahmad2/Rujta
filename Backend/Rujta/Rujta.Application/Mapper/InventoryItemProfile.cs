using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;

namespace Rujta.Application.Mapper
{
    public class InventoryItemProfile : Profile
    {
        public InventoryItemProfile()
        {
            CreateMap<InventoryItem, InventoryItemDto>()
                .ForMember(dest => dest.MedicineName,
                           opt => opt.MapFrom(src => src.Medicine != null ? src.Medicine.Name : null))
                .ForMember(dest => dest.CategoryId,
                           opt => opt.MapFrom(src => src.Medicine != null ? src.Medicine.CategoryId : null))
                .ForMember(dest => dest.CategoryName,
                           opt => opt.MapFrom(src => src.Medicine != null && src.Medicine.Category != null
                                                      ? src.Medicine.Category.Name
                                                      : null))
                .ReverseMap()
                .ForMember(dest => dest.Medicine, opt => opt.Ignore())
                .ForMember(dest => dest.Pharmacy, opt => opt.Ignore())
                .ForMember(dest => dest.Prescription, opt => opt.Ignore());
        }
    }

}
