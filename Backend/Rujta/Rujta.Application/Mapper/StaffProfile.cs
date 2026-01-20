using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;

namespace Rujta.Application.MappingProfiles
{
    public class StaffProfile : Profile
    {
        public StaffProfile()
        {
            CreateMap<PharmacistDto, Pharmacist>()
            .ForAllMembers(opts =>
                opts.Condition((src, dest, srcMember) => srcMember != null));


            CreateMap<Pharmacist, PharmacistDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(dest => dest.ManagerID, opt => opt.MapFrom(src => src.ManagerId))
            .ForMember(dest => dest.PharmacyID, opt => opt.MapFrom(src => src.PharmacyId))
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));
        }
    }
}
