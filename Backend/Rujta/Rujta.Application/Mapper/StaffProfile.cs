using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;

namespace Rujta.Application.MappingProfiles
{
    public class StaffProfile : Profile
    {
        public StaffProfile()
        {
            // Map DTO to entity, only if source property is not null
            CreateMap<StaffDto, Staff>()
                .ForAllMembers(opts =>
                    opts.Condition((src, dest, srcMember) => srcMember != null));

            // Map entity to DTO
            CreateMap<Staff, StaffDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));
        }
    }
}
