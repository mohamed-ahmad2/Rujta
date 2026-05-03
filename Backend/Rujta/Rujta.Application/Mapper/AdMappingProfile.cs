// Rujta.Application/Mapper/AdMappingProfile.cs
using AutoMapper;
using Rujta.Application.DTOs.AdDto;
using Rujta.Domain.Entities;

namespace Rujta.Application.Mapper
{
    public class AdMappingProfile : Profile
    {
        public AdMappingProfile()
        {
            
            CreateMap<AdDto, Ad>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.StartsAt, opt => opt.Ignore())
                .ForMember(dest => dest.ExpiresAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore());

         
            CreateMap<Ad, AdDto>();
        }
    }
}
